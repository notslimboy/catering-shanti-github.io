import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GalleryMasonry } from "@/components/GalleryMasonry";
import { SiteHeader } from "@/components/SiteHeader";
import { GALLERY_ITEMS } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Galeri Acara",
  description: "Lihat dokumentasi acara yang pernah dilayani Shanti Catering di Surabaya.",
  alternates: { canonical: "/galeri" },
  openGraph: {
    title: "Galeri Acara | Shanti Catering",
    description: "Dokumentasi acara dari Shanti Catering.",
    images: [{ url: "/images/nasi-kotak.jpg", width: 1200, height: 630, alt: "Sajian Shanti Catering" }],
  },
};

export default function GaleriPage() {
  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />

      <section aria-labelledby="gallery-page-title" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 md:pb-24 md:pt-10 lg:px-8">
        <div className="max-w-2xl">
          <h1 id="gallery-page-title" className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Galeri acara</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Dokumentasi acara Shanti Catering sedang ditambahkan secara bertahap. Sementara ini, galeri menampilkan ilustrasi sajian dari dapur kami.</p>
        </div>
        <div className="mt-8">
          <GalleryMasonry items={GALLERY_ITEMS} />
        </div>
      </section>

      <section className="border-t border-border bg-muted/35">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 md:py-20">
          <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sedang menyiapkan acara?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Pilih paket atau ceritakan kebutuhan acara Anda melalui formulir pesanan.</p>
          </div>
          <Link
            href="/#pesan"
            className="mt-6 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Isi kebutuhan acara <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
