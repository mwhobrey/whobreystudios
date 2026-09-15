"use client";

import Link from "next/link";
import {
  Box,
  Camera,
  Clapperboard,
  Layers,
  PenTool,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { IntakeCategorySlug } from "@/lib/project-intake/categories";
import { intakeDetailsHref } from "@/lib/project-intake/categories";

const iconBySlug: Record<IntakeCategorySlug, LucideIcon> = {
  digital: PenTool,
  "3d-printing": Box,
  vinyl: Layers,
  photography: Camera,
  aerial: Clapperboard,
  other: Sparkles,
};

type Option = {
  slug: IntakeCategorySlug;
  label: string;
};

export function ServiceTypePicker({ options }: { options: Option[] }) {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:gap-4">
      {options.map(({ slug, label }) => {
        const Icon = iconBySlug[slug];
        return (
          <Link
            key={slug}
            href={intakeDetailsHref(slug, slug === "digital" ? "logo" : undefined)}
            className="ws-focus-ring group ws-glass flex min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-[color:var(--border-default)] px-4 py-6 text-center transition hover:border-[color:var(--brand-primary)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-floating)] sm:min-h-[140px]"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-inset)] text-[color:var(--brand-primary)] transition group-hover:border-[color:var(--brand-primary)]/40">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-semibold leading-snug text-text-primary sm:text-base">
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
