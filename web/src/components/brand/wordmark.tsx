import Image from "next/image";
import { cx } from "@/lib/ui";
import { BRAND_ASSETS } from "@/lib/brand/assets";

type Variant = "horizontal" | "stacked" | "monogram";

type Props = {
  variant?: Variant;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** @deprecated Accent stripe only applies to legacy SVG fallback */
  accent?: boolean;
};

const logoHeight = { sm: 28, md: 36, lg: 48, xl: 64 } as const;
const emblemSize = { sm: 28, md: 36, lg: 48, xl: 56 } as const;

/**
 * Whobrey Studios brand mark — client logo from `public/brand/`.
 */
export function Wordmark({
  variant = "horizontal",
  size = "md",
  className,
}: Props) {
  if (variant === "monogram") {
    return (
      <span className={cx("inline-flex items-center", className)}>
        <Image
          src={BRAND_ASSETS.emblemSvg}
          alt=""
          width={emblemSize[size]}
          height={emblemSize[size]}
          className="h-auto w-auto shrink-0"
          aria-hidden
          unoptimized
        />
      </span>
    );
  }

  const h = logoHeight[size];
  const width = variant === "stacked" ? Math.round(h * 0.85) : Math.round(h * 4.2);

  return (
    <span className={cx("inline-flex items-center", className)}>
      <Image
        src={BRAND_ASSETS.logoHorizontal}
        alt="Whobrey Studios"
        width={width}
        height={h}
        className="h-auto max-h-full w-auto shrink-0 object-contain object-left"
        priority={size === "md" || size === "lg"}
      />
    </span>
  );
}
