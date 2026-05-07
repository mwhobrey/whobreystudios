"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { loginAction, type LoginActionState } from "./actions";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {} as LoginActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label="Email" required>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@studio.com"
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
        iconRight={<ArrowRight className="h-4 w-4" />}
        className="mt-2 w-full"
      >
        {pending ? "Signing in" : "Sign in"}
      </AppButton>
    </form>
  );
}
