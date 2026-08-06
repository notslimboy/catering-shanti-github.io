"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { PublicPackage } from "@/lib/catalog";

interface PackageCategoryCardProps {
  item: PublicPackage;
  image: string;
  className?: string;
}

function formatIdr(value: number | null) {
  if (value === null) return "Hubungi untuk harga";
  return `Mulai ${new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function PackageCategoryCard({ item, image, className = "" }: PackageCategoryCardProps) {
  const priceLabel = `${formatIdr(item.priceFromIdr)}${item.priceUnit ? ` / ${item.priceUnit}` : ""}`;

  return (
    <article className={`group grid overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:border-emerald-600/35 hover:shadow-[0_14px_36px_rgba(6,78,59,0.10)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] sm:grid-cols-[minmax(0,1fr)_minmax(180px,42%)] ${className}`}>
      <div className="order-2 flex min-w-0 flex-col p-5 sm:order-1 sm:p-6">
        {item.category && <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{item.category.name}</p>}
        <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">{item.name}</h3>
        {item.summary && <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{item.summary}</p>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <p className="font-bold text-emerald-800 dark:text-emerald-300">{priceLabel}</p>
          {item.minimumServings !== null && <p className="font-medium text-muted-foreground">Min. {item.minimumServings} porsi</p>}
        </div>
        {item.includedItems.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm leading-5 text-muted-foreground">
            {item.includedItems.slice(0, 5).map((includedItem) => (
              <li key={includedItem} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                <span>{includedItem}</span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/pesan?intent=package&packageId=${encodeURIComponent(item.slug)}`}
          onClick={() => trackEvent("package_selected", { selection_type: "package_consultation", selection_id: item.id, selection_slug: item.slug, source: "package_card", page: window.location.pathname })}
          className="mt-5 inline-flex w-fit items-center gap-1 rounded-lg text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300"
        >
          Tanyakan paket <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="relative order-1 aspect-[16/9] overflow-hidden sm:order-2 sm:aspect-auto">
        <Image src={image} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw" className="object-cover transition duration-500 group-hover:scale-[1.035]" />
      </div>
    </article>
  );
}
