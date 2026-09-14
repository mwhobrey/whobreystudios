export type IntakeCategorySlug =
  | "digital"
  | "3d-printing"
  | "vinyl"
  | "photography"
  | "aerial"
  | "other";

export type IntakeCategory = {
  slug: IntakeCategorySlug;
  label: string;
  description: string;
  /** When true, the client must describe the project type on the details step. */
  requiresCustomType?: boolean;
};

export const INTAKE_CATEGORIES: IntakeCategory[] = [
  {
    slug: "digital",
    label: "Digital Graphics",
    description: "Logos, brand assets, social graphics, and web-ready artwork.",
  },
  {
    slug: "3d-printing",
    label: "3D Printing",
    description: "Custom prints, prototypes, and small-run production pieces.",
  },
  {
    slug: "vinyl",
    label: "Vinyl Decals",
    description: "Vehicle graphics, signage, labels, and cut vinyl applications.",
  },
  {
    slug: "photography",
    label: "Photography",
    description: "Product, portrait, and on-location studio photography.",
  },
  {
    slug: "aerial",
    label: "Aerial Photography / Videography",
    description: "Drone photo and video for property, events, and marketing.",
  },
  {
    slug: "other",
    label: "Something Else!",
    description: "Have a unique idea? Tell us what you have in mind.",
    requiresCustomType: true,
  },
];

export function getIntakeCategory(slug: string | null | undefined): IntakeCategory | null {
  if (!slug) return null;
  return INTAKE_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function intakeDetailsHref(slug: IntakeCategorySlug, kind?: string): string {
  const base = `/projects/new/details?category=${slug}`;
  return kind ? `${base}&kind=${kind}` : base;
}
