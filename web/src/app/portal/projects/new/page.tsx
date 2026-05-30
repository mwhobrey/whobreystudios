import { redirect } from "next/navigation";

/** Unified intake flow — service picker lives at `/projects/new`. */
export default function LegacyPortalNewProjectPage() {
  redirect("/projects/new");
}
