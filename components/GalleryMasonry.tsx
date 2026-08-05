"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { GalleryItem } from "@/lib/public-content";

type GalleryMasonryProps = {
  items: GalleryItem[];
  id?: string;
  variant?: "page" | "teaser";
};

export function GalleryMasonry({ items, id = "galeri-acara", variant = "page" }: GalleryMasonryProps) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeItem) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) return;
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [activeItem]);

  const openImage = (item: GalleryItem, opener: HTMLButtonElement) => {
    if (item.status !== "ready" || !item.imageSrc) return;
    openerRef.current = opener;
    setActiveItem(item);
  };

  const isTeaser = variant === "teaser";
  const gridClassName = isTeaser
    ? "grid grid-cols-2 auto-rows-[148px] gap-3 min-[480px]:auto-rows-[168px] min-[480px]:gap-4 md:grid-cols-6 md:auto-rows-[136px]"
    : "grid grid-cols-2 auto-rows-[148px] gap-3 min-[480px]:auto-rows-[168px] min-[480px]:gap-4 md:grid-cols-6 md:auto-rows-[136px] lg:grid-cols-12 lg:auto-rows-[132px]";

  return (
    <>
      {items.length === 0 ? (
        <div id={id} className="flex min-h-48 items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">Belum ada dokumentasi acara yang ditampilkan.</p>
        </div>
      ) : (
        <div id={id} className={gridClassName}>
          {items.map((item) => {
            const isReady = item.status === "ready" && Boolean(item.imageSrc);
            const itemGridClassName = isTeaser ? (item.teaserGridClassName ?? item.gridClassName) : item.gridClassName;

            if (!isReady) {
              return (
                <div key={item.id} className={`relative overflow-hidden rounded-2xl border border-border bg-card p-4 ${itemGridClassName}`}>
                  <div className="flex h-full flex-col justify-end">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-800 dark:text-emerald-300">Dokumentasi menyusul</p>
                    <p className="mt-2 text-sm font-bold tracking-tight text-foreground">{item.title}</p>
                    {!isTeaser && <p className="mt-1 hidden max-w-[26ch] text-xs leading-5 text-muted-foreground md:block">{item.description}</p>}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={(event) => openImage(item, event.currentTarget)}
                className={`group relative overflow-hidden rounded-2xl bg-muted text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background ${itemGridClassName}`}
                aria-label={`Buka ilustrasi ${item.title}`}
              >
                <Image
                  src={item.imageSrc!}
                  alt={item.alt}
                  fill
                  sizes={item.sizes ?? "(max-width: 767px) 50vw, (max-width: 1023px) 34vw, 25vw"}
                  className="object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/25 to-transparent px-4 pb-3 pt-10 text-sm font-bold text-white opacity-100 transition-opacity duration-200 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 group-focus-visible:opacity-100">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {activeItem?.imageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveItem(null);
          }}
        >
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="gallery-dialog-title" className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
              <div>
                <h2 id="gallery-dialog-title" className="text-base font-bold text-foreground">{activeItem.title}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{activeItem.description}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setActiveItem(null)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-300"
                aria-label="Tutup foto"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 bg-muted">
              <Image
                src={activeItem.imageSrc}
                alt={activeItem.alt}
                width={1600}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 960px"
                className="max-h-[calc(100dvh-9rem)] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
