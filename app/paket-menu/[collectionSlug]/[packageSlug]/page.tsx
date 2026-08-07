import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { PackagePhotoPlaceholder } from "@/components/PackageCatalogueCard";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllPackageCollections, getAllPackages, getPackageByCollectionAndSlug } from "@/lib/package-catalogue";
import { getWhatsAppUrl } from "@/lib/site";

type PackageDetailPageProps = {
  params: Promise<{ collectionSlug: string; packageSlug: string }>;
};

function getCollection(collectionSlug: string) {
  return getAllPackageCollections().find((collection) => collection.slug === collectionSlug) ?? null;
}

export function generateStaticParams() {
  return getAllPackages().flatMap((item) => {
    const collection = getAllPackageCollections().find((candidate) => candidate.id === item.collectionId);
    return collection ? [{ collectionSlug: collection.slug, packageSlug: item.slug }] : [];
  });
}

export async function generateMetadata({ params }: PackageDetailPageProps): Promise<Metadata> {
  const { collectionSlug, packageSlug } = await params;
  const collection = getCollection(collectionSlug);
  const item = collection ? getPackageByCollectionAndSlug(collection.id, packageSlug) : null;
  return item && collection ? { title: `${item.name} | ${collection.name}` } : {};
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { collectionSlug, packageSlug } = await params;
  const collection = getCollection(collectionSlug);
  const item = collection ? getPackageByCollectionAndSlug(collection.id, packageSlug) : null;

  if (!collection || !item) {
    notFound();
  }

  const whatsappUrl = getWhatsAppUrl(`Halo Shanti Catering, saya ingin tanya paket ${item.name} dari koleksi ${collection.name}.`);

  return (
    <main className="min-h-[100dvh] bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:px-8">
        <Link href={`/paket-menu/${collection.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke {collection.name}
        </Link>
        <article className="mt-6 grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[1.05fr_0.95fr]">
          <div className="aspect-[4/3] min-h-72 lg:min-h-[520px] lg:aspect-auto">
            {item.photoStatus === "pending" && <PackagePhotoPlaceholder />}
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{collection.name}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{item.name}</h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground">{item.summary}</p>
            <div className="mt-7">
              <h2 className="text-lg font-bold text-foreground">Termasuk dalam paket</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                {item.includedItems.map((includedItem) => (
                  <li key={includedItem} className="flex items-start gap-3">
                    <Check className="mt-1 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                    {includedItem}
                  </li>
                ))}
              </ul>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:translate-y-px">
              <MessageCircle className="size-4" aria-hidden="true" />
              Tanyakan paket via WhatsApp
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
