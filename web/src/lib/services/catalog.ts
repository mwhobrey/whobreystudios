import type { LucideIcon } from "lucide-react";
import { Image, Palette, Printer, Smartphone, Sticker } from "lucide-react";
import type { IntakeCategorySlug } from "@/lib/project-intake/categories";

export type ServiceEntry = {
  id: string;
  title: string;
  startingAt: string;
  icon: LucideIcon;
  summary: string;
  details: string;
  /** Intake category to jump straight into from this service's "Get started" button. */
  intakeCategory: IntakeCategorySlug;
  /** Optional intake sub-flow (e.g. the logo design questionnaire) within that category. */
  intakeKind?: string;
};

export const SERVICE_CATALOG: ServiceEntry[] = [
  {
    id: "logo-brand-systems",
    title: "Logo & Brand Systems",
    startingAt: "Projects starting at $450",
    icon: Palette,
    intakeCategory: "digital",
    intakeKind: "logo",
    summary:
      "Professional logo and identity systems built for consistent use across digital platforms, print materials, apparel, signage, merchandise, and other real-world applications.",
    details:
      "Services may include primary and secondary logos, icon marks, color systems, typography recommendations, brand guidelines, and launch-ready supporting assets. Final pricing depends on the depth of the identity system and the number of required deliverables.",
  },
  {
    id: "digital-media",
    title: "Digital Media",
    startingAt: "Projects starting at $65",
    icon: Image,
    intakeCategory: "digital",
    summary:
      "Custom graphics for social media, websites, digital campaigns, advertising, presentations, promotional materials, and branded content.",
    details:
      "Services may include social graphics, platform banners, campaign layouts, digital flyers, thumbnails, presentation graphics, infographics, and coordinated launch assets. Projects involving multiple platforms or deliverables are quoted as a unified package.",
  },
  {
    id: "app-icons",
    title: "App Icons & Digital Icon Systems",
    startingAt: "Projects starting at $350",
    icon: Smartphone,
    intakeCategory: "digital",
    summary:
      "Original app icons and coordinated digital icon systems designed for clear recognition, small-scale use, and modern platform requirements.",
    details:
      "Services may include custom app-icon concepts, platform-ready variations, developer handoff assets, adaptive icon preparation, and coordinated UI icon sets. Coding, app development, and store submission are not included unless specifically quoted.",
  },
  {
    id: "vinyl-decals",
    title: "Vinyl Decals & Lettering",
    startingAt: "Minimum physical order: $15",
    icon: Sticker,
    intakeCategory: "vinyl",
    summary:
      "Custom cut-vinyl decals and lettering for personal, promotional, and business applications.",
    details:
      "Available work includes names, lettering, window graphics, business identification, layered decals, and repeat production orders. Pricing depends on dimensions, detail, number of colors, quantity, artwork condition, and installation or production requirements.",
  },
  {
    id: "3d-printing",
    title: "3D Printing & Custom Modeling",
    startingAt: "Projects starting at $20",
    icon: Printer,
    intakeCategory: "3d-printing",
    summary:
      "Custom 3D-printed products, prototypes, functional components, replacement parts, branded items, and short production runs.",
    details:
      "Pricing is determined after reviewing the model, dimensions, material, machine time, complexity, finishing requirements, and quantity. Custom modeling, CAD work, precision-fit components, assemblies, and commercial production are quoted according to project scope.",
  },
];

export const SERVICE_PRICING_DISCLAIMER =
  "The prices shown below represent baseline project thresholds and are provided to help establish general budget expectations. Every Whobrey Studios project is reviewed and quoted individually based on scope, complexity, deliverables, quantity, revisions, production requirements, and turnaround time. A starting price is not a guaranteed project total. Final pricing is provided through a custom quote before work begins.";
