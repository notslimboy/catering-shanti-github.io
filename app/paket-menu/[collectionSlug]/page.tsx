import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClosingCta } from "@/components/ClosingCta";
import { PackageCatalogueCard } from "@/components/PackageCatalogueCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getAllPackageCollections, getPackagesByCollection } from "@/lib/package-catalogue";

type CollectionPageProps = {
  params: Promise<{ collectionSlug: string }>;
};

function getCollection(collectionSlug: string) {
  return getAllPackageCollections().find((collection) => collection.slug === collectionSlug) ?? null;
}

export function generateStaticParams() {
  return getAllPackageCollections().map((collection) => ({ collectionSlug: collection.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { collectionSlug } = await params;
  const collection = getCollection(collectionSlug);
  return collection ? { title: `${collection.name} | Paket menu` } : {};
}

export default async function PackageCollectionPage({ params }: CollectionPageProps) {
  const { collectionSlug } = await params;
  const collection = getCollection(collectionSlug);

  if (!collection) {
    notFound();
  }

  const packages = getPackagesByCollection(collection.id);

  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:px-8">
        <Link href="/menu#paket-selera" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke paket dan menu
        </Link>
        <div className="mt-6 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-[-0.045em] text-foreground sm:text-5xl">{collection.name}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{collection.description} Lihat susunan hidangan sebelum menanyakan paket.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => <PackageCatalogueCard key={item.id} item={item} collection={collection} />)}
        </div>
      </section>
      <ClosingCta
        image="/images/nasi-kotak.jpg"
        imageAlt="Sajian catering untuk berbagai kebutuhan acara"
        title={`Ingin menyesuaikan paket ${collection.name}?`}
        description="Ceritakan jumlah porsi, tanggal, lokasi, dan menu yang diinginkan. Kami bantu menyesuaikannya dengan acara Anda."
        primaryAction={{ kind: "link", href: `/pesan?intent=custom&topic=${encodeURIComponent(collection.name)}`, label: "Ceritakan kebutuhan" }}
        secondaryAction={{ kind: "whatsapp", placement: "package_collection_closing_cta", label: "Tanya via WhatsApp" }}
      />
      <SiteFooter />
    </main>
  );
}
