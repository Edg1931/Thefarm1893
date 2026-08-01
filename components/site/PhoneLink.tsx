import { phoneDisplay } from "@/lib/content-flags";

/**
 * Renders the venue phone number.
 *
 * While the number is still flagged as a placeholder in `contentStatus`, this
 * deliberately renders a non-clickable element instead of a `tel:` link — a
 * guest tapping a reserved 555 number and reaching nothing is worse than not
 * offering the tap at all. Flip `contentStatus.phone` to "real" in
 * lib/content.ts and every instance becomes a live tap-to-call link.
 *
 * Drop-in replacement for `<a href={business.phoneHref}>`.
 */
export function PhoneLink({
  className,
  children,
  ariaLabel,
}: {
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const { href, placeholder } = phoneDisplay();

  if (placeholder || !href) {
    return (
      <span
        className={className}
        // Not interactive on purpose: this number isn't real yet.
        title="Phone number coming soon"
        data-placeholder-phone="true"
      >
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
