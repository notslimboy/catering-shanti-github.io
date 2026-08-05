import { redirect } from "next/navigation";
import { AdminDenied, AdminShell, SetupPanel } from "@/app/admin/components/admin-ui";
import { getAdminAccess } from "@/lib/admin";

// The access check reads an HttpOnly Supabase session cookie. Keep the entire
// protected route tree dynamic so builds without local secrets still succeed.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAdminAccess();

  if (access.state === "setup") return <SetupPanel />;
  if (access.state === "signed-out") redirect("/admin/login");
  if (access.state === "forbidden") return <AdminDenied />;

  return <AdminShell user={access.user}>{children}</AdminShell>;
}
