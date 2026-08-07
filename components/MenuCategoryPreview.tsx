"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CustomMenuCtaCard } from "@/components/CustomMenuCtaCard";
import { MenuCard } from "@/components/MenuCard";
import type { PublicMenuItem } from "@/lib/catalog";

type MenuCategoryPreviewProps = {
  id: string;
  title: string;
  description: string;
  items: readonly PublicMenuItem[];
  images: Record<string, string>;
  customMenuPlacement?: string;
};

const mobilePreviewCount = 4;
const tabletPreviewCount = 6;
const desktopPreviewCount = 8;

const previewControlClass = "mt-5 min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-700/35 bg-emerald-50/70 px-5 text-center text-sm font-bold text-emerald-800 transition-colors hover:border-emerald-700/55 hover:bg-emerald-100/70 active:translate-y-px active:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-emerald-400/35 dark:bg-emerald-950/35 dark:text-emerald-200 dark:hover:border-emerald-300/55 dark:hover:bg-emerald-950/60 dark:active:bg-emerald-950/70 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background";

export function MenuCategoryPreview({
  id,
  title,
  description,
  items,
  images,
  customMenuPlacement,
}: MenuCategoryPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMoreMobileItems = items.length > mobilePreviewCount;
  const hasMoreTabletItems = items.length > tabletPreviewCount;
  const hasMoreDesktopItems = items.length > desktopPreviewCount;
  const hasMoreItems = hasMoreMobileItems || hasMoreTabletItems || hasMoreDesktopItems;
  const itemListId = `${id}-menu-items`;

  return (
    <section aria-labelledby={`${id}-heading`}>
      <div className="max-w-xl">
        <h3 id={`${id}-heading`} className="text-2xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div id={itemListId} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const hiddenClass = !isExpanded
            ? index >= desktopPreviewCount
              ? "hidden"
              : index >= tabletPreviewCount
                ? "hidden lg:block"
                : index >= mobilePreviewCount
                  ? "hidden md:block"
                  : undefined
            : undefined;
          return (
            <div key={item.id} className={hiddenClass}>
              <MenuCard item={item} image={images[item.id]} compact />
            </div>
          );
        })}
        {customMenuPlacement && <CustomMenuCtaCard placement={customMenuPlacement} />}
      </div>
      {hasMoreItems && (
        <>
          {isExpanded ? (
            <button
              type="button"
              aria-expanded="true"
              aria-controls={itemListId}
              onClick={() => setIsExpanded(false)}
              className={`inline-flex ${previewControlClass}`}
            >
              Tampilkan lebih sedikit <ChevronDown className="size-4 shrink-0 rotate-180" aria-hidden="true" />
            </button>
          ) : (
            <>
              {hasMoreMobileItems && (
                <button
                  type="button"
                  aria-expanded="false"
                  aria-controls={itemListId}
                  onClick={() => setIsExpanded(true)}
                  className={`inline-flex ${previewControlClass} md:hidden`}
                >
                  {`Lihat ${items.length - mobilePreviewCount} menu lainnya`} <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
                </button>
              )}
              {hasMoreTabletItems && (
                <button
                  type="button"
                  aria-expanded="false"
                  aria-controls={itemListId}
                  onClick={() => setIsExpanded(true)}
                  className={`hidden ${previewControlClass} md:inline-flex lg:hidden`}
                >
                  {`Lihat ${items.length - tabletPreviewCount} menu lainnya`} <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
                </button>
              )}
              {hasMoreDesktopItems && (
                <button
                  type="button"
                  aria-expanded="false"
                  aria-controls={itemListId}
                  onClick={() => setIsExpanded(true)}
                  className={`hidden ${previewControlClass} lg:inline-flex`}
                >
                  {`Lihat ${items.length - desktopPreviewCount} menu lainnya`} <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
