"use client";

import { useMemo, useState } from "react";
import { FormField } from "@/components/ui/form-field";

const PLACEMENT_OPTIONS = [
  "Website / Social Media",
  "Embroidered Uniforms / Hats",
  "Screen-printed T-shirts",
  "Vehicle Doors / Vinyl Decals",
  "Large Signage",
  "Print Materials (Business cards, flyers)",
];

type Answers = {
  logoBusinessName: string;
  tagline: string;
  industry: string;
  competitors: string;
  targetCustomer: string;
  personalityWords: string;
  coreMessage: string;
  brandColorsRequired: string;
  colorsToAvoid: string;
  inspirationLinks: string;
  imageryDirection: string;
  placements: string[];
  additionalAssets: string;
  deadlineBudget: string;
};

const EMPTY_ANSWERS: Answers = {
  logoBusinessName: "",
  tagline: "",
  industry: "",
  competitors: "",
  targetCustomer: "",
  personalityWords: "",
  coreMessage: "",
  brandColorsRequired: "",
  colorsToAvoid: "",
  inspirationLinks: "",
  imageryDirection: "",
  placements: [],
  additionalAssets: "",
  deadlineBudget: "",
};

function composeNotes(a: Answers): string {
  const lines: string[] = ["Logo Design Client Intake"];

  const section = (title: string, rows: Array<[string, string]>) => {
    const populated = rows.filter(([, value]) => value.trim().length > 0);
    if (populated.length === 0) return;
    lines.push("", title);
    for (const [label, value] of populated) {
      lines.push(`${label}: ${value.trim()}`);
    }
  };

  section("Section 1: The Basics", [
    ["Business name (exactly as it should appear in the logo)", a.logoBusinessName],
    ["Tagline", a.tagline],
    ["Industry / niche", a.industry],
    ["Primary competitors", a.competitors],
  ]);

  section("Section 2: The Brand Identity", [
    ["Target customer", a.targetCustomer],
    ["Brand personality in 3 words", a.personalityWords],
    ["Core message or feeling", a.coreMessage],
  ]);

  section("Section 3: Visual Direction", [
    ["Brand colors we must use", a.brandColorsRequired],
    ["Colors to avoid", a.colorsToAvoid],
    ["Logos/brands they like (links + why)", a.inspirationLinks],
    ["Imagery to include or avoid", a.imageryDirection],
  ]);

  section("Section 4: Application & Scope", [
    ["Where the logo will live", a.placements.join(", ")],
    ["Additional assets needed now", a.additionalAssets],
    ["Target deadline and budget range", a.deadlineBudget],
  ]);

  return lines.join("\n");
}

/** Renders the logo design intake questionnaire and mirrors its answers into a hidden `notes` field. */
export function LogoIntakeFields() {
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const notes = useMemo(() => composeNotes(answers), [answers]);

  function set<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function togglePlacement(option: string) {
    setAnswers((prev) => ({
      ...prev,
      placements: prev.placements.includes(option)
        ? prev.placements.filter((p) => p !== option)
        : [...prev.placements, option],
    }));
  }

  return (
    <div className="grid gap-6">
      <input type="hidden" name="notes" value={notes} />

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-faint">
          Section 1 — The basics
        </legend>
        <FormField label="Business name" required hint="Exactly as it should appear in the logo">
          <input
            className="ws-input"
            required
            value={answers.logoBusinessName}
            onChange={(e) => set("logoBusinessName", e.target.value)}
          />
        </FormField>
        <FormField label="Tagline" hint="Do you have one, and does it need to be in the main logo?">
          <input
            className="ws-input"
            value={answers.tagline}
            onChange={(e) => set("tagline", e.target.value)}
          />
        </FormField>
        <FormField label="Industry / niche" hint="What exactly do you do?">
          <input
            className="ws-input"
            value={answers.industry}
            onChange={(e) => set("industry", e.target.value)}
          />
        </FormField>
        <FormField label="Primary competitors" hint="List 2-3 so we know who you're up against">
          <input
            className="ws-input"
            value={answers.competitors}
            onChange={(e) => set("competitors", e.target.value)}
          />
        </FormField>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-faint">
          Section 2 — The brand identity
        </legend>
        <FormField label="Target customer" hint="Be specific: age, income, lifestyle, or business type">
          <textarea
            className="ws-input"
            rows={2}
            value={answers.targetCustomer}
            onChange={(e) => set("targetCustomer", e.target.value)}
          />
        </FormField>
        <FormField
          label="Brand personality in 3 words"
          hint="If your brand was a person, how would you describe them? (e.g., Rugged, Premium, Approachable)"
        >
          <input
            className="ws-input"
            value={answers.personalityWords}
            onChange={(e) => set("personalityWords", e.target.value)}
          />
        </FormField>
        <FormField label="Core message or feeling" hint="What does this logo need to communicate?">
          <textarea
            className="ws-input"
            rows={2}
            value={answers.coreMessage}
            onChange={(e) => set("coreMessage", e.target.value)}
          />
        </FormField>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-faint">
          Section 3 — Visual direction
        </legend>
        <FormField label="Brand colors we must use" hint="Leave blank if none">
          <input
            className="ws-input"
            value={answers.brandColorsRequired}
            onChange={(e) => set("brandColorsRequired", e.target.value)}
          />
        </FormField>
        <FormField label="Colors we must absolutely avoid" hint="Leave blank if none">
          <input
            className="ws-input"
            value={answers.colorsToAvoid}
            onChange={(e) => set("colorsToAvoid", e.target.value)}
          />
        </FormField>
        <FormField label="Logos or brands you like the look of" hint="2-3 links, and tell us why you like them">
          <textarea
            className="ws-input"
            rows={2}
            value={answers.inspirationLinks}
            onChange={(e) => set("inspirationLinks", e.target.value)}
          />
        </FormField>
        <FormField
          label="Imagery to definitely include or avoid"
          hint='e.g., "Must include a wrench," or "No generic swooshes"'
        >
          <input
            className="ws-input"
            value={answers.imageryDirection}
            onChange={(e) => set("imageryDirection", e.target.value)}
          />
        </FormField>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-faint">
          Section 4 — Application &amp; scope
        </legend>
        <FormField label="Where will this logo live the most?" hint="Check all that apply">
          <div className="grid gap-2 sm:grid-cols-2">
            {PLACEMENT_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[color:var(--brand-primary)]"
                  checked={answers.placements.includes(option)}
                  onChange={() => togglePlacement(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </FormField>
        <FormField
          label="Additional assets needed right now"
          hint="e.g., business card layout, social media profile graphics, vector files for a sign shop"
        >
          <input
            className="ws-input"
            value={answers.additionalAssets}
            onChange={(e) => set("additionalAssets", e.target.value)}
          />
        </FormField>
        <FormField label="Target deadline and budget range">
          <input
            className="ws-input"
            value={answers.deadlineBudget}
            onChange={(e) => set("deadlineBudget", e.target.value)}
          />
        </FormField>
      </fieldset>
    </div>
  );
}
