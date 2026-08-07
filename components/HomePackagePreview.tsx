"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PackageCatalogueCard } from "@/components/PackageCatalogueCard";
import type { PackageCatalogueItem, PackageCollection } from "@/lib/package-catalogue";

type HomePackageTab = "wedding" | "chinese" | "traditional";

type HomePackagePreviewProps = {
  collections: readonly PackageCollection[];
  packages: readonly PackageCatalogueItem[];
};

const tabs: ReadonlyArray<{ id: HomePackageTab; label: string; collectionIds: readonly string[] }> = [
  { id: "wedding", label: "Wedding", collectionIds: ["wedding-package"] },
  { id: "chinese", label: "Chinese Food", collectionIds: ["chinese-food"] },
  { id: "traditional", label: "Menu tradisional", collectionIds: ["menu-ndeso", "traditional-package", "jawa-tengah", "jawa-timur", "jakarta"] },
];

const collectionCtaClass = "mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-700/35 bg-emerald-50/70 px-5 text-center text-sm font-bold text-emerald-800 transition-colors hover:border-emerald-700/55 hover:bg-emerald-100/70 active:translate-y-px active:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-emerald-400/35 dark:bg-emerald-950/35 dark:text-emerald-200 dark:hover:border-emerald-300/55 dark:hover:bg-emerald-950/60 dark:active:bg-emerald-950/70 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background";

export function HomePackagePreview({ collections, packages }: HomePackagePreviewProps) {
  const [activeTab, setActiveTab] = useState<HomePackageTab>("wedding");
  const selectedTab = tabs.find((tab) => tab.id === activeTab)!;
  const selectedCollections = collections.filter((collection) => selectedTab.collectionIds.includes(collection.id));
  const previewPackages = selectedCollections.flatMap((collection) => packages
    .filter((item) => item.collectionId === collection.id)
    .map((item) => ({ item, collection })));
  const desktopRemainingCount = previewPackages.length - 3;
  const compactRemainingCount = previewPackages.length - 2;
  const catalogueHref = `/menu?filter=${activeTab}#paket-selera`;

  return (
    <section className="border-y border-border bg-muted/45 py-16 md:py-24" aria-labelledby="paket-pilihan-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 id="paket-pilihan-title" className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Paket pilihan</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Pilih koleksi paket, lalu lihat susunan hidangan yang ingin ditanyakan.</p>
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Pilihan koleksi paket">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`homepage-package-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="homepage-package-preview"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${isActive ? "bg-emerald-700 text-white" : "border border-border bg-card text-foreground hover:border-emerald-700/35 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div key={activeTab} id="homepage-package-preview" role="tabpanel" aria-labelledby={`homepage-package-tab-${activeTab}`} className="mt-8 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {previewPackages.slice(0, 3).map(({ item, collection }, index) => (
              <div key={item.id} className={index >= 2 ? "hidden lg:block" : undefined}>
                <PackageCatalogueCard item={item} collection={collection} />
              </div>
            ))}
          </div>
          {compactRemainingCount > 0 && (
            <Link href={catalogueHref} className={`${collectionCtaClass} lg:hidden`}>
              {`Lihat ${compactRemainingCount} paket lainnya`} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          )}
          {desktopRemainingCount > 0 && (
            <Link href={catalogueHref} className={`${collectionCtaClass} hidden lg:inline-flex`}>
              {`Lihat ${desktopRemainingCount} paket lainnya`} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
