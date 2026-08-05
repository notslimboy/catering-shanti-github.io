import Link from "next/link";
import { LockKeyhole, UtensilsCrossed } from "lucide-react";
import { LoginForm } from "@/app/admin/components/login-form";
import { SetupPanel } from "@/app/admin/components/admin-ui";
import { hasSupabaseConfig } from "@/lib/supabase/server";

// Supabase configuration is supplied by the deployment environment, and the
// `next` URL is request-specific after proxy redirects.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!hasSupabaseConfig()) return <SetupPanel />;

  const { next } = await searchParams;
  const safeNext = next?.startsWith("/admin") ? next : "/admin";

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-5 py-12">
      <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" aria-hidden="true" />
          </span>
          Shanti Catering
        </Link>
        <div className="mt-7 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Masuk sebagai admin</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Kelola menu, paket, harga, dan pesanan dari satu tempat.
        </p>
        <LoginForm next={safeNext} />
      </section>
    </main>
  );
}
