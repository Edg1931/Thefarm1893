import Link from "next/link";
import { Lock, Mail, Phone } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
import { business } from "@/lib/content";
import { PhoneLink } from "./PhoneLink";

/**
 * Shown when a visitor isn't (yet) authorized for a portal. `signin` means "we
 * just need you to sign in"; `denied` means the account isn't linked to this
 * booking — deliberately vague so it never confirms whether a booking exists.
 */
export function PortalAccessNotice({ reason }: { reason: "signin" | "denied" }) {
  const signin = reason === "signin";
  return (
    <PortalShell title={signin ? "Sign in to your portal" : "This portal isn't available"}>
      <div className="mx-auto max-w-md rounded-2xl border border-ink/8 bg-parchment p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brass/15"><Lock size={22} className="text-brass" /></span>
        {signin ? (
          <>
            <p className="mt-4 text-ink-soft">
              Your planning portal is private. Enter your email and we&apos;ll send a secure sign-in link — no password to remember.
            </p>
            <Link href="/portal/signin" className="btn btn-primary mt-6"><Mail size={16} /> Email me a sign-in link</Link>
          </>
        ) : (
          <>
            <p className="mt-4 text-ink-soft">
              This account isn&apos;t linked to that booking. If you have a link from us, open it directly — or get in touch and we&apos;ll send a fresh one.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2">
              <Link href="/portal/signin" className="btn btn-primary"><Mail size={16} /> Try a different email</Link>
              <PhoneLink className="btn btn-ghost !py-2 !text-xs"><Phone size={14} /> Call the Farm</PhoneLink>
            </div>
          </>
        )}
      </div>
    </PortalShell>
  );
}
