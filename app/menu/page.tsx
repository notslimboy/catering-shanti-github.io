import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClosingCta } from "@/components/ClosingCta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EventPackageGuideCard } from "@/components/EventPackageGuideCard";
import { PackageCategoryCard } from "@/components/PackageCategoryCard";
import { PackageCataloguePreview } from "@/components/PackageCataloguePreview";
import { MenuCategoryPreview } from "@/components/MenuCategoryPreview";
import { getActiveMenuItems, getActivePackages } from "@/lib/catalog";
import { getCatalogImageUrl } from "@/lib/catalog-image";
import { EVENT_PACKAGE_GUIDES } from "@/lib/event-package-guides";
import { getAllPackageCollections, getAllPackages } from "@/lib/package-catalogue";

export const metadata: Metadata = {
  title: "Menu & paket catering Surabaya",
  description: "Pilih menu, nasi kotak, prasmanan, tumpeng, atau paket catering untuk acara keluarga dan kantor di Surabaya.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Menu & paket catering Surabaya | Shanti Catering",
    description: "Pilih menu dan paket catering untuk acara keluarga, kantor, dan kebutuhan harian.",
    images: [{ url: "/images/tumpeng-hero.webp", width: 1366, height: 768, alt: "Contoh sajian tumpeng Shanti Catering" }],
  },
};

const packageFallbackImages: Record<string, string> = {
  "catering-pernikahan-surabaya": "/images/nasi-kotak.jpg",
  "catering-kantor-surabaya": "/images/paket-coffe-break.jpg",
  "catering-aqiqah-surabaya": "/images/ayam-canton.jpg",
  "tumpeng-surabaya": "/images/tumpeng-hero.webp",
  "prasmanan-acara-surabaya": "/images/beef.webp",
  "nasi-kotak-surabaya": "/images/jajan-pasar.jpg",
};

const menuGroups = [
  { id: "makanan", title: "Makanan", description: "Pilihan hidangan utama dan lauk untuk disusun sesuai acara." },
  { id: "jajanan", title: "Jajanan", description: "Kue dan snack untuk pelengkap acara atau snack box." },
  { id: "minuman", title: "Minuman", description: "Pilihan minuman dan coffee break untuk menyegarkan acara." },
] as const;

export default async function MenuPage() {
  const [menuItems, packages] = await Promise.all([getActiveMenuItems(), getActivePackages()]);
  const catalogueCollections = getAllPackageCollections();
  const cataloguePackages = getAllPackages();
  const packageGroups = Array.from(
    packages.reduce((groups, item) => {
      if (!item.category) return groups;
      const existing = groups.get(item.category.id);
      if (existing) existing.items.push(item);
      else groups.set(item.category.id, { name: item.category.name, slug: item.category.slug, items: [item] });
      return groups;
    }, new Map<string, { name: string; slug: string; items: typeof packages }>()).values()
  );
  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-12 md:pb-24 md:pt-16 lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Paket & menu</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-foreground sm:text-5xl">Pilih menu untuk acara yang sedang disiapkan</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">Mulai dari paket acara atau menu satuan. Pilih yang sesuai, lalu isi jumlah porsi dan tanggal acara.</p>
          <Link href="#jenis-acara" className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px">
            Pilih jenis acara <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-emerald-950 sm:min-h-[390px]">
          <Image src="/images/tumpeng-hero.webp" alt="Tumpeng untuk acara syukuran" fill preload sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 642px" className="object-cover" style={{ objectPosition: "center 48%" }} />
        </div>
      </section>

      <section id="jenis-acara" className="scroll-mt-24 border-y border-border bg-muted/45 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Mulai dari jenis acara</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">Pilih contoh acara, lalu ceritakan menu, tanggal, lokasi, dan jumlah porsi yang dibutuhkan.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 items-start gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {EVENT_PACKAGE_GUIDES.map((guide) => (
              <EventPackageGuideCard key={guide.slug} guide={guide} compactOnMobile />
            ))}
          </div>
        </div>
      </section>

      <PackageCataloguePreview collections={catalogueCollections} packages={cataloguePackages} />

      {packageGroups.length > 0 && (
        <section id="paket" className="scroll-mt-24 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Paket yang siap dipilih</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">Pilih paket yang tersedia, lalu isi jumlah porsi dan tanggal acara.</p>
            </div>
            <div className="mt-10 space-y-14">
              {packageGroups.map((group) => (
                <section key={group.slug} aria-labelledby={`paket-${group.slug}`}>
                  <h3 id={`paket-${group.slug}`} className="text-2xl font-bold tracking-tight text-foreground">{group.name}</h3>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {group.items.map((item) => (
                      <PackageCategoryCard
                        key={item.id}
                        item={item}
                        image={getCatalogImageUrl(item.imagePath, packageFallbackImages[group.slug] ?? "/images/nasi-kotak.jpg")}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="menu-satuan" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Menu satuan</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Pilih menu untuk dimasukkan ke formulir pesanan. Harga dikonfirmasi sesuai menu dan jumlah porsi.</p>
        </div>
        <div className="mt-10 space-y-16">
          {menuGroups.map((group) => {
            const items = menuItems.filter((item) => item.menuType === group.id);
            if (items.length === 0) return null;
            return (
              <MenuCategoryPreview
                key={group.id}
                id={group.id}
                title={group.title}
                description={group.description}
                items={items}
                images={Object.fromEntries(items.map((item) => [item.id, getCatalogImageUrl(item.imagePath, "/images/nasi-kotak.jpg")]))}
                customMenuPlacement={group.id === "makanan" || group.id === "minuman" ? `menu_custom_card_${group.id}` : undefined}
              />
            );
          })}
        </div>
      </section>

      <ClosingCta
        image="/images/menu-arab.webp"
        imageAlt="Hidangan untuk menu catering custom"
        title="Belum menemukan susunan menu yang pas?"
        description="Ceritakan acara, jumlah porsi, tanggal, dan pilihan hidangan. Kami bantu menyusun menu yang sesuai."
        primaryAction={{ kind: "link", href: "/pesan?intent=custom&topic=Menu%20custom", label: "Susun menu custom" }}
        secondaryAction={{ kind: "whatsapp", placement: "menu_closing_cta", label: "Tanya menu" }}
      />
      <SiteFooter />
    </main>
  );
}
