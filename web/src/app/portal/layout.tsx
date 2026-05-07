import { requireRole } from "@/lib/auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["client"]);
  return <>{children}</>;
}
