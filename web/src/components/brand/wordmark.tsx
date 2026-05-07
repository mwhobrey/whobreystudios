import { cx } from "@/lib/ui";

type Variant = "horizontal" | "stacked" | "monogram";

type Props = {
  variant?: Variant;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Show the brand-primary accent stripe under the monogram. */
  accent?: boolean;
};

/**
 * Whobrey Studios brand mark. Composed of:
 *   1. An SVG monogram glyph (layered chevrons reading as a "W")
 *   2. An HTML wordmark using Geist Sans with tight tracking
 *
 * Colors flow from `currentColor` (primary glyph) and `var(--brand-primary)`
 * (accent stripe), so the same component works inverted on light surfaces.
 */
export function Wordmark({
  variant = "horizontal",
  size = "md",
  className,
  accent = true,
}: Props) {
  const sizing = {
    sm: { glyph: 22, gap: "gap-2",  text: "text-sm",  sub: "text-[9px]" },
    md: { glyph: 28, gap: "gap-2.5", text: "text-base", sub: "text-[10px]" },
    lg: { glyph: 40, gap: "gap-3",  text: "text-xl",  sub: "text-[11px]" },
    xl: { glyph: 56, gap: "gap-4",  text: "text-3xl", sub: "text-xs" },
  }[size];

  const monogram = (
    <Monogram size={sizing.glyph} accent={accent} />
  );

  if (variant === "monogram") {
    return <span className={cx("inline-flex items-center", className)}>{monogram}</span>;
  }

  if (variant === "stacked") {
    return (
      <span className={cx("inline-flex flex-col items-center text-center", sizing.gap, className)}>
        {monogram}
        <span className="flex flex-col leading-none">
          <span className={cx("font-semibold tracking-tight text-text-primary", sizing.text)}>
            Whobrey
          </span>
          <span
            className={cx(
              "mt-1 font-medium uppercase tracking-[0.32em] text-text-faint",
              sizing.sub,
            )}
          >
            Studios
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={cx("inline-flex items-center", sizing.gap, className)}>
      {monogram}
      <span className="flex flex-col leading-none">
        <span
          className={cx(
            "font-semibold tracking-tight text-text-primary",
            sizing.text,
          )}
        >
          Whobrey
        </span>
        <span
          className={cx(
            "mt-1 font-medium uppercase tracking-[0.32em] text-text-faint",
            sizing.sub,
          )}
        >
          Studios
        </span>
      </span>
    </span>
  );
}

function Monogram({ size, accent }: { size: number; accent: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Outer rounded chip */}
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="7.5"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      {/* Layered chevrons forming a stylized W */}
      <path
        d="M5.5 9.5 L11 22 L13 22 L16 14.5 L19 22 L21 22 L26.5 9.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner highlight chevron */}
      <path
        d="M9 12.5 L12 19 L13.25 19 L16 12.5"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Brand accent bar — the only token-colored element */}
      {accent ? (
        <rect
          x="9.5"
          y="25"
          width="13"
          height="2"
          rx="1"
          fill="var(--brand-primary)"
        />
      ) : null}
    </svg>
  );
}
