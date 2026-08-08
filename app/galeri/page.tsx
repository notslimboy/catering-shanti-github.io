import type { Metadata } from "next";
import { ClosingCta } from "@/components/ClosingCta";
import { GalleryMasonry } from "@/components/GalleryMasonry";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GALLERY_ITEMS } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Contoh sajian catering Surabaya",
  description: "Lihat contoh sajian Shanti Catering di Surabaya. Galeri ini berupa ilustrasi menu, bukan dokumentasi acara.",
  alternates: { canonical: "/galeri" },
  openGraph: {
    title: "Contoh sajian | Shanti Catering Surabaya",
    description: "Contoh sajian menu Shanti Catering untuk berbagai kebutuhan acara.",
    images: [{ url: "/images/nasi-kotak.jpg", width: 1200, height: 630, alt: "Contoh sajian nasi kotak Shanti Catering" }],
  },
};

export default function GaleriPage() {
  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />

      <section aria-labelledby="gallery-page-title" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 md:pb-24 md:pt-10 lg:px-8">
        <div className="max-w-2xl">
          <h1 id="gallery-page-title" className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Contoh sajian Shanti Catering</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Galeri ini menampilkan contoh sajian dari dapur kami sebagai gambaran menu. Ini bukan dokumentasi acara atau foto pelanggan.</p>
        </div>
        <div className="mt-8">
          <GalleryMasonry items={GALLERY_ITEMS} />
        </div>
      </section>

      <ClosingCta
        image="/images/tumpeng-hero.webp"
        imageAlt="Tumpeng untuk acara syukuran"
        title="Sudah menemukan inspirasi untuk acaranya?"
        description="Ceritakan menu, jumlah porsi, tanggal, dan lokasi. Kami bantu menerjemahkan inspirasi Anda menjadi kebutuhan catering."
        primaryAction={{ kind: "link", href: "/pesan?intent=custom", label: "Ceritakan acara" }}
        secondaryAction={{ kind: "whatsapp", placement: "gallery_closing_cta", label: "Tanya via WhatsApp" }}
      />
      <SiteFooter />
    </main>
  );
}
