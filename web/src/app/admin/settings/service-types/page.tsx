import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { listAllServiceTypesAdmin } from "@/lib/data/service-types";
import { AppButton } from "@/components/ui/app-button";
import { AppShell } from "@/components/ui/app-shell";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";
import { EmptyState } from "@/components/ui/empty-state";
import {
  createServiceTypeAction,
  updateServiceTypeAction,
} from "./actions";

export const metadata = {
  title: "Service types",
};

type PageProps = { searchParams: Promise<{ err?: string }> };

export default async function AdminServiceTypesPage({ searchParams }: PageProps) {
  const { err } = await searchParams;
  const rows = await listAllServiceTypesAdmin();

  return (
    <AppShell
      variant="admin"
      eyebrow="Admin · Settings"
      title="Service types"
      subtitle={
        <>
          Clients pick from these on{" "}
          <span className="text-text-secondary">New project</span>. Hidden types stay attached to
          past projects but won&apos;t appear on new requests.
        </>
      }
      backLink={
        <Link
          href="/admin"
          className="ws-focus-ring inline-flex items-center gap-1.5 rounded hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      }
    >
      {err ? (
        <div className="mb-6">
          <AlertBanner tone="error">{err}</AlertBanner>
        </div>
      ) : null}

      <section className="ws-panel p-5">
        <h2 className="text-sm font-semibold text-text-primary">Add a type</h2>
        <form
          action={createServiceTypeAction}
          className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_8rem_auto]"
        >
          <FormField label="Name" required>
            <input
              name="name"
              required
              placeholder="e.g. Logo refresh"
              className="ws-input"
            />
          </FormField>
          <FormField label="Sort order" hint="Optional · auto if blank">
            <input
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              placeholder="auto"
              className="ws-input tabular-nums"
            />
          </FormField>
          <AppButton
            type="submit"
            roleVariant="admin"
            iconLeft={<Plus className="h-3.5 w-3.5" />}
          >
            Add
          </AppButton>
        </form>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="ws-eyebrow">Catalog</h2>
        {rows.length === 0 ? (
          <EmptyState
            title="No service types yet."
            description="Add one above, or run the seed script to populate defaults."
          />
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.id}>
                <form
                  action={updateServiceTypeAction}
                  className="ws-panel grid items-end gap-3 p-4 sm:grid-cols-[1fr_5rem_8rem_auto_auto]"
                >
                  <input type="hidden" name="id" value={row.id} />
                  <FormField label="Name">
                    <input
                      name="name"
                      defaultValue={row.name}
                      required
                      className="ws-input"
                    />
                  </FormField>
                  <FormField label="Sort">
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={row.sortOrder}
                      min={0}
                      max={9999}
                      className="ws-input tabular-nums"
                    />
                  </FormField>
                  <FormField label="Status">
                    <select
                      name="isActive"
                      defaultValue={row.isActive ? "true" : "false"}
                      className="ws-input"
                    >
                      <option value="true">Active</option>
                      <option value="false">Hidden</option>
                    </select>
                  </FormField>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="ws-eyebrow">Projects</span>
                    <span className="ws-mono py-2 tabular-nums text-text-secondary">
                      {row._count.projects}
                    </span>
                  </div>
                  <AppButton type="submit" variant="secondary">
                    Save
                  </AppButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
