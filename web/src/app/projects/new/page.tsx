import type { Metadata } from "next";
import { IntakeShell } from "@/components/marketing/intake-shell";
import { ServiceTypePicker } from "@/components/project-intake/service-type-picker";
import { INTAKE_CATEGORIES } from "@/lib/project-intake/categories";

export const metadata: Metadata = {
  title: "New project",
  description: "Choose what you want to create with Whobrey Studios.",
};

export default function NewProjectPickerPage() {
  return (
    <IntakeShell title="New Project">
      <div className="text-center">
        <p className="text-lg font-medium text-text-muted sm:text-xl">What are we creating?</p>
      </div>

      <div className="mt-8">
        <ServiceTypePicker
          options={INTAKE_CATEGORIES.map(({ slug, label }) => ({ slug, label }))}
        />
      </div>
    </IntakeShell>
  );
}
