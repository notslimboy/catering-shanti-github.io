"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { PublicMenuItem } from "@/lib/catalog";

interface MenuCardProps {
  item: PublicMenuItem;
  image: string;
  compact?: boolean;
}

export function MenuCard({ item, image, compact = false }: MenuCardProps) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:border-emerald-600/35 hover:shadow-[0_14px_36px_rgba(6,78,59,0.10)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
      <div className={`relative overflow-hidden ${compact ? "aspect-[5/3]" : "aspect-[16/10]"}`}>
        <Image
          src={image}
          alt={item.name}
          fill
          sizes={compact ? "(max-width: 768px) 82vw, (max-width: 1200px) 45vw, 29vw" : "(max-width: 768px) 100vw, 32vw"}
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{item.category}</p>
        <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">{item.name}</h3>
        {item.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>}
        <div className="mt-5 flex items-center justify-end">
          <a
            href={`/?menuId=${encodeURIComponent(item.id)}#pesan`}
            onClick={() => trackEvent("package_selected", { selection_type: "menu", selection_id: item.id })}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-1 text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300"
          >
            Pilih menu <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
