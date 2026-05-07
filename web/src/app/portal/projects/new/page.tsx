import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listActiveServiceTypes } from "@/lib/data/service-types";
import { NewProjectForm } from "./form";
import { AppShell } from "@/components/ui/app-shell";

export const metadata = {
  title: "New project",
};

export default async function NewProjectPage() {
  const serviceTypes = await listActiveServiceTypes();
  return (
    <AppShell
      variant="portal"
      eyebrow="New project request"
      title="Tell the studio what you need."
      subtitle="A short brief now saves a long thread later. Attach references if you have them."
      backLink={
        <Link
          href="/portal"
          className="ws-focus-ring inline-flex items-center gap-1.5 rounded hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Your projects
        </Link>
      }
    >
      <NewProjectForm serviceTypes={serviceTypes} />
    </AppShell>
  );
}
