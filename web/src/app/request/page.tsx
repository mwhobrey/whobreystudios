import { redirect } from "next/navigation";

/** @deprecated Use `/projects/new` — kept for bookmarks and external links. */
export default function LegacyRequestPage() {
  redirect("/projects/new");
}
