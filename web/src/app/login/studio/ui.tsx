"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { studioLoginAction, type StudioLoginActionState } from "./actions";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";

export function StudioLoginForm() {
  const [state, formAction, pending] = useActionState(studioLoginAction, {} as StudioLoginActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label="Email" required>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@whobrey.local"
          className="ws-input"
        />
      </FormField>
      <FormField label="Password" required>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••••"
          className="ws-input"
        />
      </FormField>
      {state?.error ? <AlertBanner tone="error">{state.error}</AlertBanner> : null}
      <AppButton
        type="submit"
        loading={pending}
        size="lg"
        roleVariant="admin"
        iconRight={<ArrowRight className="h-4 w-4" />}
        className="mt-2 w-full"
      >
        {pending ? "Signing in" : "Sign in"}
      </AppButton>
    </form>
  );
}
