import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { EventPackageGuideCard } from "@/components/EventPackageGuideCard";
import { PackageCategoryCard } from "@/components/PackageCategoryCard";
import { CustomMenuCtaCard } from "@/components/CustomMenuCtaCard";
import { MenuCard } from "@/components/MenuCard";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { WhatsAppBrandIcon } from "@/components/icons/WhatsAppIcon";
import { getActiveMenuItems, getActivePackages } from "@/lib/catalog";
import { getCatalogImageUrl } from "@/lib/catalog-image";
import { EVENT_PACKAGE_GUIDES } from "@/lib/event-package-guides";

const packageFallbackImages: Record<string, string> = {
  "catering-pernikahan-surabaya": "/images/nasi-kotak.jpg",
  "catering-kantor-surabaya": "/images/paket-coffe-break.jpg",
  "catering-aqiqah-surabaya": "/images/ayam-canton.jpg",
  "tumpeng-surabaya": "/images/tumpeng.jpg",
  "prasmanan-acara-surabaya": "/images/beef.jpg",
  "nasi-kotak-surabaya": "/images/jajan-pasar.jpg",
};

const menuGroups = [
  { id: "makanan", title: "Makanan", description: "Pilihan hidangan utama dan lauk untuk disusun sesuai acara." },
  { id: "jajanan", title: "Jajanan", description: "Kue dan snack untuk pelengkap acara atau snack box." },
  { id: "minuman", title: "Minuman", description: "Pilihan minuman dan coffee break untuk menyegarkan acara." },
] as const;

export default async function MenuPage() {
  const [menuItems, packages] = await Promise.all([getActiveMenuItems(), getActivePackages()]);
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
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Paket & Menu</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-foreground sm:text-5xl">Pilih kebutuhan untuk acara Anda</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">Mulai dari paket acara atau menu satuan. Klik pilihan yang sesuai untuk mengisi formulir pemesanan.</p>
          <Link href="#jenis-acara" className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px">
            Pilih jenis acara <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-emerald-950 sm:min-h-[390px]">
          <Image src="/images/tumpeng.jpg" alt="Tumpeng untuk acara syukuran" fill priority sizes="(max-width: 767px) 100vw, 55vw" className="object-cover" />
        </div>
      </section>

      <section id="jenis-acara" className="scroll-mt-24 border-y border-border bg-muted/45 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Catering untuk setiap momen</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">Mulai dari jenis acara Anda. Isi menu dan harga kami sesuaikan dengan jumlah porsi serta kebutuhan acara.</p>
          </div>
          <div className="mt-8 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {EVENT_PACKAGE_GUIDES.map((guide) => (
              <EventPackageGuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      {packageGroups.length > 0 && (
        <section id="paket" className="scroll-mt-24 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Paket yang siap dipilih</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">Pilih paket aktif, lalu isi jumlah porsi dan tanggal acara Anda.</p>
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

      <section id="custom" className="mx-auto grid max-w-7xl gap-0 overflow-hidden rounded-2xl border border-border bg-card px-4 py-0 sm:px-6 md:my-24 md:grid-cols-2 md:px-0 lg:mx-auto lg:px-0">
        <div className="relative min-h-[280px] md:order-2 md:min-h-full">
          <Image src="/images/menu-arab.jpg" alt="Hidangan untuk menu custom" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center py-10 md:order-1 md:p-10 lg:p-14">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground">Butuh menu yang lebih khusus?</h2>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">Ceritakan acara dan kebutuhan Anda. Kami bisa membantu menyusun pilihan menu sebelum Anda memesan.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/?request=custom#pesan" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px">
              Pilih menu custom <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <WhatsAppCta placement="menu_custom" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-700/25 px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 active:translate-y-px dark:text-emerald-300 dark:hover:bg-emerald-950/40">
              <WhatsAppBrandIcon className="h-4 w-4" /> Konsultasi via WhatsApp
            </WhatsAppCta>
          </div>
        </div>
      </section>

      <section id="menu-satuan" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Menu satuan</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Pilih menu untuk memasukkannya ke formulir pesanan. Harga kami konfirmasi sesuai kebutuhan acara.</p>
        </div>
        <div className="mt-10 space-y-16">
          {menuGroups.map((group) => {
            const items = menuItems.filter((item) => item.menuType === group.id);
            if (items.length === 0) return null;
            return (
              <section key={group.id} aria-labelledby={`${group.id}-heading`}>
                <div className="max-w-xl">
                  <h3 id={`${group.id}-heading`} className="text-2xl font-bold tracking-tight text-foreground">{group.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{group.description}</p>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => <MenuCard key={item.id} item={item} image={getCatalogImageUrl(item.imagePath, "/images/nasi-kotak.jpg")} compact />)}
                  {(group.id === "makanan" || group.id === "minuman") && <CustomMenuCtaCard placement={`menu_custom_card_${group.id}`} />}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-emerald-950 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <MessageCircle className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-bold tracking-tight">Masih ingin tanya dulu?</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-100/75">Konsultasikan kebutuhan acara Anda langsung dengan kami di WhatsApp.</p>
          </div>
          <WhatsAppCta placement="menu_footer" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 active:translate-y-px">
            <WhatsAppBrandIcon className="h-4 w-4" /> Hubungi via WhatsApp
          </WhatsAppCta>
        </div>
      </section>
    </main>
  );
}
