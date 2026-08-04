import Link from "next/link";
import { phoneDisplay } from "@/lib/content-flags";

/**
 * Renders the venue phone number.
 *
 * While the number is still flagged as a placeholder in `contentStatus`, this
 * deliberately avoids a `tel:` link — a guest tapping a reserved 555 number and
 * reaching nothing is worse than not offering the tap at all.
 *
 * Pass `fallbackHref` when this is a real call-to-action (e.g. "Call the Farm"
 * on an expired-link page). While the number is a placeholder the button then
 * routes somewhere useful instead of becoming a dead end; once the real number
 * is set it reverts to tap-to-call automatically.
 *
 * Drop-in replacement for an anchor around the phone number.
 */
export function PhoneLink({
  className,
  children,
  ariaLabel,
  fallbackHref,
  fallbackChildren,
}: {
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  /** Where to send the user while the phone number isn't real yet. */
  fallbackHref?: string;
  /** Optional alternate label to show in the fallback state. */
  fallbackChildren?: React.ReactNode;
}) {
  const { href, placeholder } = phoneDisplay();

  if (placeholder || !href) {
    // A real CTA still needs somewhere to go.
    if (fallbackHref) {
      return (
        <Link href={fallbackHref} className={className} aria-label={ariaLabel}>
          {fallbackChildren ?? children}
        </Link>
      );
    }
    // Otherwise this is just the number displayed inline — show it as text.
    return (
      <span className={className} title="Phone number coming soon" data-placeholder-phone="true">
        {children}
      </span>
    );
  }

  return (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
