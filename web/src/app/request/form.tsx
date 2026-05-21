"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowRight,
  ContactIcon,
  MailCheck,
  Sparkles,
} from "lucide-react";
import { guestRequestFormAction, type GuestRequestFormState } from "./actions";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";

function fieldError(state: GuestRequestFormState | undefined, key: string): string | null {
  return state?.fieldErrors?.[key]?.[0] ?? null;
}

export function GuestRequestForm({
  serviceTypes,
}: {
  serviceTypes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(guestRequestFormAction, {});

  if (state.submitted) {
    return (
      <div className="ws-fade-up ws-panel max-w-xl p-8 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)] text-[color:var(--brand-primary)]">
          <MailCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-text-primary">Check your email</h2>
        <p className="mt-3 text-sm text-text-muted">
          Your request was received. When you&apos;re ready to follow progress, sign in to the
          client portal with{" "}
          {state.contactEmail ? (
            <span className="ws-mono font-medium text-text-secondary">{state.contactEmail}</span>
          ) : (
            "the same email you used here"
          )}
          .
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login">
            <AppButton roleVariant="portal" iconRight={<ArrowRight className="h-4 w-4" />}>
              Sign in
            </AppButton>
          </Link>
          <Link
            href="/"
            className="ws-focus-ring rounded-md px-3 py-2 text-sm font-medium text-text-muted transition hover:text-text-primary"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <GuestRequestFields
      serviceTypes={serviceTypes}
      state={state}
      formAction={formAction}
      pending={pending}
    />
  );
}

function GuestRequestFields({
  serviceTypes,
  state,
  formAction,
  pending,
}: {
  serviceTypes: { id: string; name: string }[];
  state: GuestRequestFormState;
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  const [serviceChoice, setServiceChoice] = useState<string>(
    () => serviceTypes[0]?.id ?? "__other__",
  );
  const showOther = serviceTypes.length === 0 ? true : serviceChoice === "__other__";

  return (
    <form action={formAction} className="ws-fade-up grid gap-6">
      {state?.error ? <AlertBanner tone="error">{state.error}</AlertBanner> : null}

      <Section
        icon={<ContactIcon className="h-4 w-4" />}
        title="Contact"
        subtitle="So we know where to reach you."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Full name"
            required
            error={fieldError(state, "fullName")}
            className="sm:col-span-2"
          >
            <input name="fullName" required autoComplete="name" className="ws-input" />
          </FormField>
          <FormField
            label="Business name"
            error={fieldError(state, "businessName")}
            className="sm:col-span-2"
            hint="Optional — leave blank if this is a personal project."
          >
            <input name="businessName" autoComplete="organization" className="ws-input" />
          </FormField>
          <FormField label="Phone" required error={fieldError(state, "phone")}>
            <input name="phone" type="tel" required autoComplete="tel" className="ws-input" />
          </FormField>
          <FormField label="Email" required error={fieldError(state, "contactEmail")}>
            <input
              name="contactEmail"
              type="email"
              required
              autoComplete="email"
              className="ws-input"
            />
          </FormField>
          <FormField
            label="Preferred contact"
            required
            error={fieldError(state, "preferredContactMethod")}
            className="sm:col-span-2"
          >
            <select
              name="preferredContactMethod"
              required
              defaultValue="email"
              className="ws-input"
            >
              <option value="email">Email</option>
              <option value="phone">Phone call</option>
              <option value="sms">Text / SMS</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>
      </Section>

      <Section
        icon={<Sparkles className="h-4 w-4" />}
        title="Project"
        subtitle="What needs to be created or produced?"
      >
        <div className="grid gap-4">
          <FormField label="Project type" required error={fieldError(state, "projectType")}>
            {serviceTypes.length === 0 ? (
              <input
                name="projectType"
                required
                placeholder="e.g. Logo, vehicle wrap, social banner"
                className="ws-input"
              />
            ) : (
              <>
                <select
                  name="serviceTypeId"
                  required
                  value={serviceChoice}
                  onChange={(e) => setServiceChoice(e.target.value)}
                  className="ws-input"
                >
                  {serviceTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                  <option value="__other__">Other (describe below)</option>
                </select>
                {showOther ? (
                  <input
                    name="projectType"
                    required={showOther}
                    placeholder="Describe your project type"
                    className="ws-input mt-3"
                  />
                ) : null}
              </>
            )}
          </FormField>

          <FormField label="Deadline" hint="Optional" error={fieldError(state, "deadline")}>
            <input name="deadline" type="datetime-local" className="ws-input" />
          </FormField>

          <FormField
            label="Notes &amp; direction"
            hint="Sizes, tone, links to inspiration — anything that helps."
            error={fieldError(state, "notes")}
          >
            <textarea
              name="notes"
              rows={5}
              placeholder="Describe what you need…"
              className="ws-input"
            />
          </FormField>
        </div>
      </Section>

      <p className="text-xs text-text-faint">
        Attachments can be added after you sign in to the portal with the same email.
      </p>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[color:var(--border-subtle)] pt-6">
        <Link
          href="/"
          className="ws-focus-ring rounded-md text-sm font-medium text-text-muted transition hover:text-text-primary"
        >
          Cancel
        </Link>
        <AppButton
          type="submit"
          loading={pending}
          roleVariant="portal"
          iconRight={!pending ? <ArrowRight className="h-4 w-4" /> : undefined}
          size="lg"
        >
          {pending ? "Submitting" : "Submit request"}
        </AppButton>
      </div>
    </form>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ws-panel p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)] text-text-muted">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}