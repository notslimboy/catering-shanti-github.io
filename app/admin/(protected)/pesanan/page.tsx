import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";
import {
  formatDate,
  formatDateTime,
  OrderStatusBadge,
} from "@/app/admin/components/admin-ui";
import { getAdminOrders } from "@/lib/admin";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pesanan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tinjau kebutuhan pelanggan lalu perbarui status saat pesanan berjalan.</p>
      </div>

      <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-bold tracking-tight">Semua pesanan</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Menampilkan hingga 100 pesanan terbaru.</p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{orders.length}</span>
        </div>
        {orders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <ClipboardList className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 font-semibold">Belum ada pesanan</p>
            <p className="mt-1 text-sm text-muted-foreground">Data akan muncul setelah pelanggan mengirim formulir pesanan.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pesanan/${order.id}`}
                className="grid gap-2 px-5 py-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_auto_auto] sm:items-center sm:gap-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{order.customer_name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{order.reference}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{order.selection_name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{order.servings} porsi - {formatDate(order.event_date)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground sm:justify-end">
                  <span>{formatDateTime(order.created_at)}</span>
                  <ChevronRight className="size-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
