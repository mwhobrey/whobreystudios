import { permanentRedirect } from "next/navigation";

/** @deprecated Use `/projects/new` — kept for bookmarks and external links. */
export default function LegacyRequestPage() {
  permanentRedirect("/projects/new");
}
