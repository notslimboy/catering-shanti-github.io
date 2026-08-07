import Link from "next/link";
import { ArrowUpRight, ImageOff, UtensilsCrossed } from "lucide-react";
import type { PackageCatalogueItem, PackageCollection } from "@/lib/package-catalogue";

type PackageCatalogueCardProps = {
  item: PackageCatalogueItem;
  collection: PackageCollection;
};

export function PackagePhotoPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted px-5 text-center text-muted-foreground">
      <ImageOff className="size-6 text-emerald-800 dark:text-emerald-300" aria-hidden="true" />
      <span className="text-sm font-semibold">Foto menu menyusul</span>
    </div>
  );
}

export function PackageCatalogueCard({ item, collection }: PackageCatalogueCardProps) {
  const signatureItems = item.signatureItems.slice(0, 3);
  const remainingItems = Math.max(0, item.includedItems.length - signatureItems.length);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:border-emerald-600/35 hover:shadow-[0_14px_36px_rgba(6,78,59,0.10)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
      <div className="aspect-[4/3] overflow-hidden">
        {item.photoStatus === "pending" && <PackagePhotoPlaceholder />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{collection.name}</p>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">{item.name}</h3>
        <div className="mt-3 rounded-xl bg-emerald-50/70 px-3 py-2.5 dark:bg-emerald-950/25">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <UtensilsCrossed className="size-3.5" aria-hidden="true" />
            <p>Isi paket</p>
          </div>
          <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-5 text-foreground">
            {signatureItems.map((includedItem) => (
              <li key={includedItem} className="inline-flex min-w-0 items-start gap-1.5">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-emerald-700 dark:bg-emerald-300" />
                <span>{includedItem}</span>
              </li>
            ))}
            {remainingItems > 0 && (
              <li className="font-semibold text-emerald-800 dark:text-emerald-300">+{remainingItems} hidangan lainnya</li>
            )}
          </ul>
        </div>
        <Link
          href={`/paket-menu/${collection.slug}/${item.slug}`}
          className="mt-4 inline-flex min-h-11 w-fit items-center gap-1 rounded-lg px-1 text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:text-emerald-300 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background"
        >
          Lihat detail <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
