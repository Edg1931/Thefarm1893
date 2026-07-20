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
