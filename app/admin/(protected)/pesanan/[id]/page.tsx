import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MessageCircle } from "lucide-react";
import { updateOrderStatusAction } from "@/app/admin/actions";
import {
  FlashMessage,
  formatDate,
  formatDateTime,
  formatRupiah,
  OrderStatusBadge,
} from "@/app/admin/components/admin-ui";
import { getAdminOrder, ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/admin";

function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

function EmailStatus({ status }: { status: "pending" | "sent" | "failed" | "skipped" }) {
  const label = { pending: "Menunggu", sent: "Terkirim", failed: "Gagal", skipped: "Dilewati" }[status];
  const style = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    sent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    failed: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    skipped: "bg-muted text-muted-foreground",
  }[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{label}</span>;
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const waMessage = encodeURIComponent(
    `Halo ${order.customer_name}, kami dari Shanti Catering. Kami ingin mengonfirmasi pesanan ${order.reference}.`,
  );
  const waHref = `https://wa.me/${toWhatsAppNumber(order.customer_phone)}?text=${waMessage}`;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/pesanan" className="text-sm font-semibold text-primary hover:underline">Kembali ke pesanan</Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{order.reference}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Masuk {formatDateTime(order.created_at)}</p>
        </div>
        <a href={waHref} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#148c4a] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#10743d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <MessageCircle className="size-4" aria-hidden="true" /> Chat pelanggan <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>

      <FlashMessage message={query.message} error={query.error} />

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4"><h2 className="font-bold tracking-tight">Rincian pesanan</h2></div>
          <dl className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div><dt className="text-sm font-medium text-muted-foreground">Nama pelanggan</dt><dd className="mt-1 font-semibold">{order.customer_name}</dd></div>
            <div><dt className="text-sm font-medium text-muted-foreground">Nomor WhatsApp</dt><dd className="mt-1 font-semibold">{order.customer_phone}</dd></div>
            <div><dt className="text-sm font-medium text-muted-foreground">Pilihan</dt><dd className="mt-1 font-semibold">{order.selection_name}</dd></div>
            <div><dt className="text-sm font-medium text-muted-foreground">Harga snapshot</dt><dd className="mt-1 font-semibold">{formatRupiah(order.selection_price_idr)}{order.selection_price_unit ? ` ${order.selection_price_unit}` : ""}</dd></div>
            <div><dt className="text-sm font-medium text-muted-foreground">Jumlah porsi</dt><dd className="mt-1 font-semibold">{order.servings} porsi</dd></div>
            <div><dt className="text-sm font-medium text-muted-foreground">Tanggal acara</dt><dd className="mt-1 font-semibold">{formatDate(order.event_date)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-sm font-medium text-muted-foreground">Alamat pengiriman</dt><dd className="mt-1 leading-6">{order.delivery_address}</dd></div>
            {order.custom_request ? <div className="sm:col-span-2"><dt className="text-sm font-medium text-muted-foreground">Kebutuhan custom</dt><dd className="mt-1 leading-6">{order.custom_request}</dd></div> : null}
            {order.notes ? <div className="sm:col-span-2"><dt className="text-sm font-medium text-muted-foreground">Catatan pelanggan</dt><dd className="mt-1 leading-6">{order.notes}</dd></div> : null}
          </dl>
        </section>

        <aside className="h-fit space-y-5 rounded-xl border border-border bg-card p-5 xl:sticky xl:top-24">
          <div><p className="text-sm font-medium text-muted-foreground">Status saat ini</p><div className="mt-2"><OrderStatusBadge status={order.status} /></div></div>
          <form action={updateOrderStatusAction} className="space-y-3">
            <input type="hidden" name="id" value={order.id} />
            <label htmlFor="status" className="block text-sm font-semibold">Ubah status</label>
            <select id="status" name="status" defaultValue={order.status} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring">
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}
            </select>
            <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Simpan status</button>
          </form>
          <div className="border-t border-border pt-5"><p className="text-sm font-medium text-muted-foreground">Notifikasi email</p><div className="mt-2"><EmailStatus status={order.email_status} /></div>{order.email_error ? <p className="mt-2 text-xs leading-5 text-rose-700 dark:text-rose-300">{order.email_error}</p> : null}</div>
        </aside>
      </div>
    </>
  );
}
