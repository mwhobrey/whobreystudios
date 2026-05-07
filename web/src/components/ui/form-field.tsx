import type { ReactNode } from "react";
import { cx } from "@/lib/ui";

/**
 * Single-call form-field primitive. Replaces hand-rolled label + hint + error
 * patterns scattered across forms with a consistent shape.
 *
 * Usage:
 *   <FormField label="Email" hint="We never share your email." error={state?.error}>
 *     <input className="ws-input" name="email" />
 *   </FormField>
 */
type Props = {
  label: string;
  /** Optional helper text shown beneath the control when there is no error. */
  hint?: ReactNode;
  /** Validation error message; takes precedence over hint when set. */
  error?: string | null;
  /** Mark the label as required (renders a subtle asterisk). */
  required?: boolean;
  /** Stretch over multiple grid columns. */
  className?: string;
  children: ReactNode;
  /** Render label inline with control (used in toolbar contexts). */
  inline?: boolean;
};

export function FormField({
  label,
  hint,
  error,
  required,
  className,
  inline,
  children,
}: Props) {
  return (
    <label
      className={cx(
        "flex text-sm",
        inline ? "flex-row items-center gap-2" : "flex-col gap-1.5",
        className,
      )}
    >
      <span className="font-medium text-text-secondary">
        {label}
        {required ? (
          <span className="ml-0.5 text-[color:var(--brand-secondary)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-[color:var(--status-danger-fg)]" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-text-faint">{hint}</span>
      ) : null}
    </label>
  );
}

/* ---------------------------------------------------------------------------
 *  Backwards-compat: previously the file exported `FieldLabel` + `FieldError`.
 *  Keep them so older callers compile while we migrate.
 * ------------------------------------------------------------------------- */
export function FieldLabel({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <FormField label={label} hint={hint}>
      {children}
    </FormField>
  );
}

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-[color:var(--status-danger-fg)]" role="alert">
      {message}
    </p>
  );
}
