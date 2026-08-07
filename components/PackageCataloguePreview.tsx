"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PackageCatalogueCard } from "@/components/PackageCatalogueCard";
import type { PackageCatalogueItem, PackageCollection } from "@/lib/package-catalogue";

type CatalogueFilter = "all" | "wedding" | "traditional" | "sambelan" | "chinese";

type PackageCataloguePreviewProps = {
  collections: readonly PackageCollection[];
  packages: readonly PackageCatalogueItem[];
};

const filters: ReadonlyArray<{ id: CatalogueFilter; label: string }> = [
  { id: "all", label: "Semua" },
  { id: "wedding", label: "Wedding" },
  { id: "traditional", label: "Menu tradisional" },
  { id: "sambelan", label: "Sambelan" },
  { id: "chinese", label: "Chinese Food" },
];

const collectionIdsByFilter: Record<Exclude<CatalogueFilter, "all">, readonly string[]> = {
  wedding: ["wedding-package"],
  traditional: ["menu-ndeso", "traditional-package", "jawa-tengah", "jawa-timur", "jakarta"],
  sambelan: ["sambelan"],
  chinese: ["chinese-food"],
};

type CatalogueReturnState = {
  activeFilter: CatalogueFilter;
  scrollY: number;
  collectionSlug?: string;
};

const catalogueReturnStoragePrefix = "shanti-package-catalogue-return:";

function isCatalogueFilter(value: string | null): value is CatalogueFilter {
  return filters.some((filter) => filter.id === value);
}

export function PackageCataloguePreview({ collections, packages }: PackageCataloguePreviewProps) {
  const [activeFilter, setActiveFilter] = useState<CatalogueFilter>("wedding");
  const [pendingRestoration, setPendingRestoration] = useState<{ token: string; state: CatalogueReturnState } | null>(null);
  const visibleCollections = activeFilter === "all"
    ? collections
    : collections.filter((collection) => collectionIdsByFilter[activeFilter].includes(collection.id));

  useEffect(() => {
    const token = (window.history.state as { catalogueReturnToken?: unknown } | null)?.catalogueReturnToken;
    if (typeof token === "string") {
      try {
        const rawState = window.sessionStorage.getItem(`${catalogueReturnStoragePrefix}${token}`);
        if (rawState) {
          const state = JSON.parse(rawState) as CatalogueReturnState;
          if (isCatalogueFilter(state.activeFilter) && typeof state.scrollY === "number") {
            const restoreFrame = window.requestAnimationFrame(() => {
              setActiveFilter(state.activeFilter);
              setPendingRestoration({ token, state });
            });
            return () => window.cancelAnimationFrame(restoreFrame);
          }
        }
      } catch {
        // Fall through to an explicit URL filter or the Wedding default.
      }
    }

    const requestedFilter = new URLSearchParams(window.location.search).get("filter");
    if (!isCatalogueFilter(requestedFilter)) return;
    const filterFrame = window.requestAnimationFrame(() => setActiveFilter(requestedFilter));
    return () => window.cancelAnimationFrame(filterFrame);
  }, []);

  useEffect(() => {
    if (!pendingRestoration || pendingRestoration.state.activeFilter !== activeFilter) return;

    let secondFrame: number | undefined;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const maximumScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        if (pendingRestoration.state.scrollY <= maximumScrollY + 8) {
          window.scrollTo({ top: pendingRestoration.state.scrollY, left: 0, behavior: "auto" });
        } else if (pendingRestoration.state.collectionSlug) {
          document.querySelector<HTMLElement>(`[data-catalogue-collection="${pendingRestoration.state.collectionSlug}"]`)
            ?.scrollIntoView({ block: "start", behavior: "auto" });
        }

        try {
          window.sessionStorage.removeItem(`${catalogueReturnStoragePrefix}${pendingRestoration.token}`);
          const historyState = window.history.state as Record<string, unknown> | null;
          if (historyState) {
            const nextHistoryState = { ...historyState };
            delete nextHistoryState.catalogueReturnToken;
            window.history.replaceState(nextHistoryState, "", window.location.href);
          }
        } catch {
          // Restoration is deliberately one-shot when browser storage is available.
        }
        setPendingRestoration(null);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
    };
  }, [activeFilter, pendingRestoration]);

  const persistCatalogueReturn = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/paket-menu/"]');
    if (!anchor) return;

    const collectionSection = anchor.closest<HTMLElement>("[data-catalogue-collection]");
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const state: CatalogueReturnState = {
      activeFilter,
      scrollY: window.scrollY,
      ...(collectionSection?.dataset.catalogueCollection ? { collectionSlug: collectionSection.dataset.catalogueCollection } : {}),
    };

    try {
      window.sessionStorage.setItem(`${catalogueReturnStoragePrefix}${token}`, JSON.stringify(state));
      window.history.replaceState({ ...(window.history.state ?? {}), catalogueReturnToken: token }, "", window.location.href);
    } catch {
      // The destination link remains a normal link if browser storage is unavailable.
    }
  };

  return (
    <section id="paket-selera" className="scroll-mt-24 py-16 md:py-24" aria-labelledby="paket-selera-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 id="paket-selera-title" className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Pilih paket berdasarkan selera</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Lihat susunan hidangan tiap paket, lalu pilih paket yang ingin ditanyakan.</p>
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Kelompok paket">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveFilter(filter.id);
                }}
                className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${isActive ? "bg-emerald-700 text-white" : "border border-border bg-card text-foreground hover:border-emerald-700/35 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"}`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10 space-y-14" onClickCapture={persistCatalogueReturn}>
          {visibleCollections.map((collection) => {
            const previewItems = packages.filter((item) => item.collectionId === collection.id);
            const desktopRemainingCount = previewItems.length - 3;
            const compactRemainingCount = previewItems.length - 2;
            return (
              <section key={collection.id} aria-labelledby={`koleksi-${collection.slug}`} data-catalogue-collection={collection.slug}>
                <div>
                  <h3 id={`koleksi-${collection.slug}`} className="text-2xl font-bold tracking-tight text-foreground">{collection.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{collection.description}</p>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {previewItems.slice(0, 3).map((item, index) => (
                    <div key={item.id} className={index >= 2 ? "hidden lg:block" : undefined}>
                      <PackageCatalogueCard item={item} collection={collection} />
                    </div>
                  ))}
                </div>
                {compactRemainingCount > 0 && (
                  <Link
                    href={`/paket-menu/${collection.slug}`}
                    className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-700/35 bg-emerald-50/70 px-5 text-center text-sm font-bold text-emerald-800 transition-colors hover:border-emerald-700/55 hover:bg-emerald-100/70 active:translate-y-px active:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-emerald-400/35 dark:bg-emerald-950/35 dark:text-emerald-200 dark:hover:border-emerald-300/55 dark:hover:bg-emerald-950/60 dark:active:bg-emerald-950/70 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background lg:hidden"
                  >
                    {`Lihat ${compactRemainingCount} paket lainnya`} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                )}
                {desktopRemainingCount > 0 && (
                  <Link
                    href={`/paket-menu/${collection.slug}`}
                    className="mt-4 hidden min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-700/35 bg-emerald-50/70 px-5 text-center text-sm font-bold text-emerald-800 transition-colors hover:border-emerald-700/55 hover:bg-emerald-100/70 active:translate-y-px active:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-emerald-400/35 dark:bg-emerald-950/35 dark:text-emerald-200 dark:hover:border-emerald-300/55 dark:hover:bg-emerald-950/60 dark:active:bg-emerald-950/70 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background lg:inline-flex"
                  >
                    {`Lihat ${desktopRemainingCount} paket lainnya`} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
