/* ============================================================================
   PAYMENTS — pluggable Stripe Checkout. Activates the moment STRIPE_SECRET_KEY
   is set in the environment; until then everything runs in demo mode (no charge,
   the flow still completes so the site is fully usable in a walkthrough).
   Uses the Stripe REST API directly — no SDK dependency to install.
   ============================================================================ */

export function paymentsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type CheckoutInput = {
  amountCents: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  email?: string;
  metadata?: Record<string, string>;
  /** Payment methods to offer. Card enables Apple/Google Pay automatically;
   *  add "us_bank_account" for ACH bank debit on larger invoices. */
  methods?: Array<"card" | "us_bank_account">;
};

/**
 * Creates a Stripe Checkout Session and returns its hosted URL. In demo mode
 * (no key) returns the success URL with `?demo=1` so the caller can complete
 * the flow without a real charge.
 */
export async function createCheckoutSession(input: CheckoutInput): Promise<{ url: string; demo: boolean }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const u = new URL(input.successUrl);
    u.searchParams.set("demo", "1");
    return { url: u.toString(), demo: true };
  }

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", input.successUrl);
  body.set("cancel_url", input.cancelUrl);
  if (input.email) body.set("customer_email", input.email);
  // Card is the default (Apple/Google Pay ride along on it); ACH is opt-in.
  (input.methods ?? ["card"]).forEach((m, i) => body.set(`payment_method_types[${i}]`, m));
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(Math.max(50, Math.round(input.amountCents))));
  body.set("line_items[0][price_data][product_data][name]", input.description.slice(0, 250));
  for (const [k, v] of Object.entries(input.metadata ?? {})) body.set(`metadata[${k}]`, String(v).slice(0, 480));

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Stripe checkout failed.");
  return { url: data.url as string, demo: false };
}

export type Installment = { label: string; amount: number; dueDate: string };

/**
 * Split a total into a deposit + N monthly installments due on the way to the
 * event date. Pure function — the caller persists the resulting invoices.
 */
export function buildInstallmentSchedule(total: number, eventDate: string, opts?: { depositPct?: number; installments?: number }): Installment[] {
  const depositPct = opts?.depositPct ?? 0.25;
  const count = Math.max(1, opts?.installments ?? 3);
  const deposit = Math.round(total * depositPct);
  const remainder = total - deposit;
  const each = Math.round(remainder / count);

  const out: Installment[] = [{ label: "Deposit", amount: deposit, dueDate: new Date().toISOString().slice(0, 10) }];
  const event = new Date(eventDate + "T00:00:00");
  for (let i = count; i >= 1; i--) {
    // space installments roughly one month apart, finishing ~2 weeks pre-event
    const due = new Date(event);
    due.setDate(due.getDate() - 14 - (i - 1) * 30);
    const amount = i === 1 ? total - deposit - each * (count - 1) : each; // absorb rounding in the last
    out.push({ label: `Installment ${count - i + 1} of ${count}`, amount, dueDate: due.toISOString().slice(0, 10) });
  }
  return out;
}

