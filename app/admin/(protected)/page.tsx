import Link from "next/link";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import {
  formatDate,
  formatDateTime,
  OrderStatusBadge,
} from "@/app/admin/components/admin-ui";
import { getAdminOverview } from "@/lib/admin";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();
  const metrics = [
    { label: "Pesanan hari ini", value: overview.ordersToday, icon: ClipboardList, href: "/admin/pesanan" },
    { label: "Perlu ditindaklanjuti", value: overview.openOrders, icon: ArrowUpRight, href: "/admin/pesanan" },
  ];

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ringkasan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lihat pesanan terbaru dan tindak lanjuti pelanggan hari ini.</p>
        </div>
        <Link
          href="/admin/pesanan"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Lihat pesanan
        </Link>
      </div>

      <section aria-label="Ringkasan pesanan" className="mt-7 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                <Icon className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight tabular-nums">{metric.value}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-bold tracking-tight">Pesanan terbaru</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Pesanan yang baru masuk akan muncul di sini.</p>
          </div>
          <Link href="/admin/pesanan" className="text-sm font-semibold text-primary hover:underline">Semua pesanan</Link>
        </div>
        {overview.recentOrders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ClipboardList className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 font-semibold">Belum ada pesanan</p>
            <p className="mt-1 text-sm text-muted-foreground">Pesanan dari formulir website akan tercatat otomatis.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {overview.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pesanan/${order.id}`}
                className="grid gap-2 px-5 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{order.customer_name}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{order.reference} - {order.selection_name}</p>
                </div>
                <p className="text-sm text-muted-foreground">Acara {formatDate(order.event_date)}</p>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-xs text-muted-foreground sm:hidden">{formatDateTime(order.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
