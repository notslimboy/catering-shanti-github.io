import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, House, MessageCircle, Truck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { WhatsAppBrandIcon } from "@/components/icons/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Catering Harian Surabaya",
  description: "Catering harian Surabaya untuk rumah dan kantor dengan menu yang berganti setiap hari. Tanyakan menu lewat WhatsApp.",
  alternates: { canonical: "/catering-harian" },
  openGraph: {
    title: "Catering Harian Surabaya | Shanti Catering",
    description: "Menu harian untuk rumah dan kantor. Tanyakan menu serta ketersediaan melalui WhatsApp.",
    images: [{ url: "/images/nasi-kotak.jpg", width: 1200, height: 630, alt: "Nasi kotak Shanti Catering" }],
  },
};

const highlights = [
  {
    icon: House,
    title: "Untuk rumah",
    description: "Pilihan makan harian untuk kebutuhan di rumah.",
  },
  {
    icon: Building2,
    title: "Untuk kantor",
    description: "Cocok untuk makan bersama tim atau kebutuhan kerja harian.",
  },
  {
    icon: Truck,
    title: "Diantar kurir",
    description: "Pesanan harian diantar dengan kurir setelah dikonfirmasi.",
  },
] as const;

export default function CateringHarianPage() {
  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] md:items-center md:gap-12 md:pb-24 md:pt-16 lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Catering Harian Surabaya</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-foreground sm:text-5xl">Catering harian Surabaya untuk rumah dan kantor</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            Menu berganti setiap hari dan diantar kurir. Tanyakan pilihan serta ketersediaannya lewat WhatsApp.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <WhatsAppCta
              placement="daily_catering_hero"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <WhatsAppBrandIcon className="h-4 w-4" /> Tanya menu
            </WhatsAppCta>
            <Link
              href="/menu"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-700/25 px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              Lihat paket acara <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-emerald-950 sm:min-h-[390px]">
          <Image
            src="/images/nasi-kotak.jpg"
            alt="Nasi kotak Shanti Catering"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border bg-muted/45 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Menu mengikuti kebutuhan harian</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">Menu hari ini bisa ditanyakan lewat WhatsApp sebelum pesanan dibuat.</p>
          </div>

          <div className="mt-10 grid gap-7 md:grid-cols-3 md:gap-8">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="border-l-2 border-emerald-700/30 pl-5 dark:border-emerald-400/40">
                  <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-start md:gap-12 md:py-24 lg:px-8">
        <div>
          <CalendarDays className="h-6 w-6 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Cara pesan catering harian</h2>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3 sm:gap-5">
          <li>
            <p className="text-base font-bold text-foreground">Tanya menu hari ini</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Hubungi kami lewat WhatsApp untuk melihat pilihan menu.</p>
          </li>
          <li>
            <p className="text-base font-bold text-foreground">Sampaikan kebutuhan</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Sampaikan jumlah pesanan dan alamat pengantaran.</p>
          </li>
          <li>
            <p className="text-base font-bold text-foreground">Tunggu konfirmasi</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Kami mengonfirmasi pesanan sebelum menyiapkan pengantaran.</p>
          </li>
        </ol>
      </section>

      <section className="border-t border-border bg-card py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <MessageCircle className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Butuh catering untuk acara?</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Lihat paket dan menu yang bisa disesuaikan dengan kebutuhan acara.</p>
          </div>
          <Link
            href="/menu"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-700/25 px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
          >
            Lihat paket & menu <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
