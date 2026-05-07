import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PostLoginPage() {
  const user = await getAppUser();
  if (!user) redirect("/login");

  if (user.role === "admin") redirect("/admin");
  redirect("/portal");
}
