import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IntakeCategoryTracker } from "@/components/analytics/intake-category-tracker";
import { IntakeShell } from "@/components/marketing/intake-shell";
import { IntakeDetailsForm } from "@/components/project-intake/intake-details-form";
import { PolicyLinks } from "@/components/legal/policy-links";
import { getAppUser } from "@/lib/auth";
import { getIntakeCategory } from "@/lib/project-intake/categories";

export const metadata: Metadata = {
  title: "Project details",
  description: "Tell Whobrey Studios about your new project.",
};

type Props = {
  searchParams: Promise<{ category?: string; kind?: string }>;
};

export default async function NewProjectDetailsPage({ searchParams }: Props) {
  const { category: categorySlug, kind } = await searchParams;
  const category = getIntakeCategory(categorySlug);
  if (!category) {
    redirect("/projects/new");
  }

  const isLogoKind = category.slug === "digital" && kind === "logo";

  const user = await getAppUser();
  const mode = user?.role === "client" ? "client" : "guest";

  return (
    <IntakeShell title="New Project">
      <IntakeCategoryTracker category={category.slug} />
      <Link
        href="/projects/new"
        className="ws-focus-ring mb-6 inline-flex items-center gap-1.5 rounded text-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Choose a different service
      </Link>

      <div className="mb-8">
        <p className="ws-eyebrow text-text-faint">Step 2 of 2</p>
        <h2 className="ws-display mt-2 text-2xl tracking-tight text-text-primary sm:text-3xl">
          {isLogoKind
            ? "Tell us about your logo design project."
            : `Tell us about your ${category.label.toLowerCase()} project.`}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-text-muted sm:text-base">
          {mode === "guest"
            ? "No account required. After you submit, sign in with the same email to track progress in the client portal."
            : "You're signed in. We'll add this project to your portal and notify the studio right away."}
        </p>
      </div>

      <IntakeDetailsForm
        category={category}
        kind={kind}
        mode={mode}
        defaultFullName={user?.name}
        defaultEmail={user?.email}
      />

      {mode === "guest" ? (
        <section className="mt-10 border-t border-[color:var(--border-subtle)] pt-6">
          <p className="ws-eyebrow text-text-faint">Policies</p>
          <PolicyLinks className="mt-3" />
        </section>
      ) : null}
    </IntakeShell>
  );
}
