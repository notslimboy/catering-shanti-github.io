import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { OrderForm } from "@/components/OrderForm";
import { OrderSelectionSummary } from "@/components/OrderSelectionSummary";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getActiveMenuItems, getActivePackages } from "@/lib/catalog";
import { resolveOrderIntent } from "@/lib/order-intent";

export const metadata: Metadata = {
  title: "Pesan catering",
  description: "Isi menu, jumlah porsi, tanggal, dan lokasi untuk melanjutkan pesanan catering Shanti Catering melalui WhatsApp.",
  alternates: { canonical: "/pesan" },
  robots: { index: false, follow: true },
};

type PesanPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSearchParams(values: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  });
  return params;
}

export default async function PesanPage({ searchParams }: PesanPageProps) {
  const [menuItems, packages, resolvedParams] = await Promise.all([
    getActiveMenuItems(),
    getActivePackages(),
    searchParams,
  ]);
  const intent = resolveOrderIntent(toSearchParams(resolvedParams), menuItems, packages);

  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:px-8">
        <Link href={intent.browseHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Ganti pilihan
        </Link>
        <div className="mt-6 max-w-2xl">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Form pemesanan</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.045em] text-foreground sm:text-5xl">Ceritakan acara yang sedang disiapkan</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">Lengkapi menu, jumlah porsi, tanggal, dan lokasi. Detail pesanan dilanjutkan lewat WhatsApp setelah data tersimpan.</p>
        </div>

        <OrderSelectionSummary intent={intent} className="mt-8" />

        <div className="mt-8">
          <Suspense fallback={<div className="min-h-[620px] rounded-2xl border border-border bg-card" aria-busy="true" />}>
            <OrderForm
              menuItems={menuItems}
              packages={packages}
              initialSelection={intent}
              source={`pesan_${intent.source}`}
              draftKey="shanti-order-draft-pesan"
            />
          </Suspense>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
