import Link from "next/link";
import { cx } from "@/lib/ui";
import { LEGAL_SLUGS, legalHref, legalLabel } from "@/lib/legal/documents";

type Props = {
  className?: string;
  linkClassName?: string;
};

/** Same-origin policy links for login, request, and portal surfaces. */
export function PolicyLinks({ className, linkClassName }: Props) {
  const linkClass = cx(
    "ws-focus-ring rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] px-2 py-1 text-text-secondary transition hover:text-text-primary",
    linkClassName,
  );

  return (
    <ul className={cx("flex flex-wrap gap-2 text-xs", className)}>
      {LEGAL_SLUGS.map((slug) => (
        <li key={slug}>
          <Link href={legalHref(slug)} className={linkClass}>
            {legalLabel(slug)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
