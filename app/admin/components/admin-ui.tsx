import Link from "next/link";
import {
  BookOpenText,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings2,
  UtensilsCrossed,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import {
  ORDER_STATUS_LABELS,
  type AdminUser,
  type OrderStatus,
} from "@/lib/admin";

const navigation = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/pesanan", label: "Pesanan", icon: ClipboardList },
];

export function formatRupiah(value: number | null) {
  if (value === null || value === undefined) return "Hubungi untuk harga";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    baru: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    dikonfirmasi: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
    diproses: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    dikirim: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
    selesai: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    dibatalkan: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function FlashMessage({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  if (!message && !error) return null;
  const isError = Boolean(error);
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
        isError
          ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
      }`}
    >
      {error ?? message}
    </div>
  );
}

export function SetupPanel() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-2xl items-center px-5 py-12">
      <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings2 className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard belum terhubung</h1>
        <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
          Lengkapi konfigurasi Supabase di environment aplikasi sebelum login dan mengelola katalog.
        </p>
        <div className="mt-6 rounded-xl bg-muted p-4 font-mono text-xs leading-6 text-foreground">
          SUPABASE_URL<br />
          SUPABASE_SERVICE_ROLE_KEY<br />
          ADMIN_EMAIL
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Setelah migration dijalankan, buat pengguna di Supabase Auth dan beri role <code>admin</code> pada tabel <code>profiles</code>.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Kembali ke website <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

export function AdminDenied() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-5 py-12">
      <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">Akses admin tidak tersedia</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Akun ini belum memiliki role admin. Masuk dengan email owner atau minta akses diperbarui di Supabase.
        </p>
        <form action={logoutAction} className="mt-6">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <LogOut className="size-4" aria-hidden="true" /> Keluar
          </button>
        </form>
      </section>
    </main>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-muted/45 text-foreground dark:bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5 font-bold tracking-tight">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-4" aria-hidden="true" />
            </span>
            <span className="truncate">Shanti Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">{user.email}</span>
            <form action={logoutAction}>
              <button
                aria-label="Keluar dari dashboard"
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-8">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav aria-label="Navigasi admin" className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-1 lg:overflow-visible">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:mt-4 lg:w-full"
            >
              <BookOpenText className="size-4" aria-hidden="true" />
              Lihat website
            </Link>
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
