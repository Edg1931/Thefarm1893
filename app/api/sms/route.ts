import { receptionistReply } from "@/lib/services/receptionist";

export const runtime = "nodejs";

/**
 * SMS concierge webhook — point a Twilio number's "A MESSAGE COMES IN" here.
 * Rosie answers by text 24/7 using the same brain as the web chat. Works with
 * or without Twilio: it always returns valid TwiML. GET returns a health/help
 * blurb so you can sanity-check the endpoint in a browser.
 */
export async function POST(req: Request) {
  let body = "";
  try {
    const form = await req.formData();
    body = String(form.get("Body") ?? "");
  } catch {
    try {
      const json = await req.json();
      body = String(json.Body ?? json.message ?? "");
    } catch { /* ignore */ }
  }

  const { reply } = await receptionistReply([{ role: "user", content: body || "Hello" }]);
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(reply)}</Message></Response>`;
  return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
}

export async function GET() {
  const configured = Boolean(process.env.TWILIO_ACCOUNT_SID);
  return Response.json({
    channel: "sms-concierge",
    status: configured ? "live" : "demo (add TWILIO_* env to go live)",
    setup: "Set your Twilio number's incoming-message webhook to POST this URL.",
  });
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string));
}
