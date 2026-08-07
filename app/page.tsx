import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CalendarDays, MapPin, MessageCircle, Truck, UtensilsCrossed } from "lucide-react";
import { CustomerLogoWall } from "@/components/CustomerLogoWall";
import { EventPackageGuideCard } from "@/components/EventPackageGuideCard";
import { FaqSection } from "@/components/FaqSection";
import { GalleryMasonry } from "@/components/GalleryMasonry";
import { GoogleReviewsSection } from "@/components/GoogleReviewsSection";
import { HomePackagePreview } from "@/components/HomePackagePreview";
import { MapSection } from "@/components/MapSection";
import { QuickOrderForm } from "@/components/QuickOrderForm";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { WhatsAppBrandIcon } from "@/components/icons/WhatsAppIcon";
import { getActiveMenuItems, getActivePackages } from "@/lib/catalog";
import { EVENT_PACKAGE_GUIDES } from "@/lib/event-package-guides";
import { getAllPackageCollections, getAllPackages } from "@/lib/package-catalogue";
import { GOOGLE_REVIEWS, GOOGLE_REVIEW_SUMMARY, GALLERY_ITEMS } from "@/lib/public-content";
import { hasGoogleReviewsSnapshotEnabled } from "@/lib/server/config";
import { getPublishedGoogleReviewsSnapshot } from "@/lib/server/google-review-snapshot-entry";

export default async function HomePage() {
  const [menuItems, packages] = await Promise.all([
    getActiveMenuItems(),
    getActivePackages(),
  ]);
  const snapshotEnabled = hasGoogleReviewsSnapshotEnabled();
  const googleReviewsSnapshot = snapshotEnabled
    ? await getPublishedGoogleReviewsSnapshot()
    : { state: "fresh_setup" as const, snapshot: null, profileUrl: null };
  const useStaticReviewFallback = !snapshotEnabled;
  const reviewSnapshot = googleReviewsSnapshot.snapshot;
  const reviewSummary = reviewSnapshot?.summary ?? {
    rating: "—",
    ratingValue: null,
    reviewCount: 0,
    observedAt: "Belum tersedia",
    profileUrl: googleReviewsSnapshot.profileUrl ?? GOOGLE_REVIEW_SUMMARY.profileUrl,
  };
  const packageCollections = getAllPackageCollections();
  const packageCatalogue = getAllPackages();

  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-12 md:pb-24 md:pt-16 lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Shanti Catering Surabaya</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.04]">Catering Surabaya untuk acara keluarga, kantor, dan harian</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Pilih paket, susun menu, atau tanya menu hari ini. Ceritakan acaranya, kami bantu pilih menu dan jumlah porsi.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu#jenis-acara" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
              Lihat paket <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <WhatsAppCta placement="hero" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-700/25 bg-transparent px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-200 dark:hover:bg-emerald-950/40">
              <WhatsAppBrandIcon className="h-4 w-4" /> Pesan via WhatsApp
            </WhatsAppCta>
          </div>
        </div>
        <div className="relative min-h-[340px] overflow-hidden rounded-2xl bg-emerald-950 sm:min-h-[430px]">
          <Image src="/images/nasi-kotak.jpg" alt="Nasi kotak dari Shanti Catering" fill preload sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 642px" className="object-cover" />
        </div>
      </section>

      <CustomerLogoWall />

      <section className="border-b border-border bg-muted/45">
        <div className="mx-auto grid max-w-7xl gap-0 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="border-b border-border py-7 md:border-b-0 md:border-r md:pr-8">
            <CalendarDays className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground">Acara keluarga</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Pernikahan, aqiqah, khitanan, ulang tahun, dan syukuran.</p>
          </div>
          <div className="border-b border-border py-7 md:border-b-0 md:border-r md:px-8">
            <UtensilsCrossed className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground">Kantor dan komunitas</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Rapat, pelatihan, seminar, coffee break, dan makan bersama.</p>
          </div>
          <div className="py-7 md:pl-8">
            <Truck className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground">Catering harian</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Menu berubah setiap hari untuk rumah dan kantor.</p>
            <Link href="/catering-harian" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300">
              Lihat catering harian <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Jenis acara</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Mulai dari acara yang sedang disiapkan</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Pilih jenis acara, lalu lihat pilihan menu dan paket yang bisa disesuaikan dengan tanggal serta jumlah porsi.</p>
        </div>
        <div className="mt-8 grid items-start gap-4 md:grid-cols-3">
          {EVENT_PACKAGE_GUIDES.slice(0, 3).map((guide) => (
            <EventPackageGuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
        <Link href="/menu#jenis-acara" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300">
          Lihat semua jenis acara <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      <HomePackagePreview collections={packageCollections} packages={packageCatalogue} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Galeri acara</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Ruang untuk cerita setiap acara</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">Galeri ini menampilkan contoh sajian dari dapur Shanti Catering. Dokumentasi acara asli akan ditambahkan saat tersedia.</p>
          </div>
          <Link href="/galeri" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300">
            Lihat galeri acara <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8">
          <GalleryMasonry id="galeri-home" variant="teaser" items={GALLERY_ITEMS.slice(0, 4)} />
        </div>
      </section>

      <section className="border-y border-border bg-muted/45 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-12 lg:px-8">
          <div className="relative min-h-[260px] overflow-hidden rounded-2xl bg-emerald-950 sm:min-h-[340px]">
            <Image src="/images/nasi-kotak.jpg" alt="Nasi kotak untuk kebutuhan catering harian" fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 45vw, 526px" className="object-cover" />
          </div>
          <div className="max-w-xl">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Catering harian</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Catering harian Surabaya untuk rumah dan kantor</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">Menu berganti setiap hari dan diantar kurir. Tanyakan pilihan serta ketersediaannya lewat WhatsApp.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/catering-harian" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                Lihat catering harian <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <WhatsAppCta placement="daily_catering_home" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-700/25 px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
                <WhatsAppBrandIcon className="h-4 w-4" /> Tanya menu hari ini
              </WhatsAppCta>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Pesan dalam tiga langkah</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Pilih menu atau paket, isi jumlah porsi dan tanggal, lalu lanjutkan di WhatsApp.</p>
        </div>
        <div className="mt-8 grid overflow-hidden rounded-2xl border border-border md:grid-cols-[0.85fr_1.15fr_0.85fr]">
          <div className="border-b border-border bg-muted/55 p-6 md:border-b-0 md:border-r">
            <p className="text-lg font-bold text-foreground">Pilih kebutuhan</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Tentukan paket acara, menu satuan, atau kebutuhan custom.</p>
          </div>
          <div className="border-b border-border p-6 md:border-b-0 md:border-r">
            <p className="text-lg font-bold text-foreground">Isi detail acara</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Tulis jumlah porsi, tanggal, alamat, dan catatan yang diperlukan.</p>
          </div>
          <div className="bg-emerald-700 p-6 text-white">
            <p className="text-lg font-bold">Konfirmasi di WhatsApp</p>
            <p className="mt-2 text-sm leading-6 text-emerald-100">Setelah pesanan tersimpan, lanjutkan detailnya bersama kami.</p>
          </div>
        </div>
      </section>

      <GoogleReviewsSection
        reviews={useStaticReviewFallback ? GOOGLE_REVIEWS : reviewSnapshot?.reviews ?? []}
        summary={useStaticReviewFallback ? GOOGLE_REVIEW_SUMMARY : reviewSummary}
        available={useStaticReviewFallback || Boolean(reviewSnapshot)}
      />
      <FaqSection />

      <section className="bg-muted/45 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:px-8">
          <div className="flex flex-col justify-between rounded-2xl bg-emerald-950 p-7 text-white sm:p-9">
            <div>
              <MessageCircle className="h-6 w-6 text-emerald-300" aria-hidden="true" />
              <h2 className="mt-5 text-3xl font-bold tracking-[-0.04em]">Sudah punya gambaran acaranya?</h2>
              <p className="mt-3 leading-7 text-emerald-100/75">Ceritakan menu, jumlah porsi, tanggal, dan lokasi. Setelah data tersimpan, detail pesanan dilanjutkan di WhatsApp.</p>
            </div>
            <p className="mt-10 inline-flex items-start gap-2 text-sm text-emerald-100/75"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> Mulyorejo, Surabaya</p>
          </div>
          <Suspense fallback={<div className="min-h-[620px] rounded-2xl border border-border bg-card" aria-busy="true" />}>
            <QuickOrderForm menuItems={menuItems} packages={packages} />
          </Suspense>
        </div>
      </section>

      <MapSection />

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>Shanti Catering. Mulyorejo, Surabaya.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/menu" className="font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300">Paket &amp; menu</Link>
            <Link href="/galeri" className="font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300">Galeri acara</Link>
            <Link href="/catering-harian" className="font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300">Catering harian</Link>
            <WhatsAppCta placement="footer" className="font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300">WhatsApp</WhatsAppCta>
          </div>
        </div>
      </footer>
    </main>
  );
}
