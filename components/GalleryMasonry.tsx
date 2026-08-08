"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Download, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import type { GalleryItem } from "@/lib/public-content";

type GalleryMasonryProps = {
  items: GalleryItem[];
  id?: string;
  variant?: "page" | "teaser";
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

const iconButtonClass = "inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-emerald-950/70 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 disabled:cursor-not-allowed disabled:opacity-35";

export function GalleryMasonry({ items, id = "galeri-acara", variant = "page" }: GalleryMasonryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const requestedIndexRef = useRef<number | null>(null);
  const navigationRequestRef = useRef(0);
  const isTeaser = variant === "teaser";
  const readyItems = items.filter((item) => item.status === "ready" && item.imageSrc);
  const activeItem = activeIndex === null ? null : readyItems[activeIndex] ?? null;
  const canGoPrevious = activeIndex !== null && activeIndex > 0;
  const canGoNext = activeIndex !== null && activeIndex < readyItems.length - 1;
  const gridClassName = isTeaser
    ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
    : "grid grid-cols-2 auto-rows-[148px] gap-3 min-[480px]:auto-rows-[168px] min-[480px]:gap-4 md:grid-cols-6 md:auto-rows-[136px] lg:grid-cols-12 lg:auto-rows-[132px]";

  const closeImage = () => {
    navigationRequestRef.current += 1;
    requestedIndexRef.current = null;
    setActiveIndex(null);
  };

  const openImage = (item: GalleryItem, opener: HTMLButtonElement) => {
    const index = readyItems.findIndex((readyItem) => readyItem.id === item.id);
    if (index < 0) return;
    openerRef.current = opener;
    requestedIndexRef.current = index;
    navigationRequestRef.current += 1;
    setZoom(MIN_ZOOM);
    setActiveIndex(index);
  };

  const setBoundedZoom = (nextZoom: number) => {
    setZoom(Math.min(Math.max(Math.round(nextZoom * 100) / 100, MIN_ZOOM), MAX_ZOOM));
  };

  const preloadImage = useCallback((source: string) => {
    if (!source) return;
    const image = new window.Image();
    image.src = source;
  }, []);

  const goTo = async (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= readyItems.length) return;
    requestedIndexRef.current = nextIndex;
    const requestId = ++navigationRequestRef.current;
    const image = new window.Image();
    image.src = readyItems[nextIndex].imageSrc!;
    try {
      await image.decode();
    } catch {
      try {
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Image failed to load"));
        });
      } catch {
        return;
      }
    }
    if (requestId !== navigationRequestRef.current || requestedIndexRef.current !== nextIndex) return;
    setZoom(MIN_ZOOM);
    setActiveIndex(nextIndex);
  };

  const isOpen = activeIndex !== null;
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
    return () => {
      if (isOpen) openerRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex === null) return;
    preloadImage(readyItems[activeIndex - 1]?.imageSrc ?? "");
    preloadImage(readyItems[activeIndex + 1]?.imageSrc ?? "");
  }, [activeIndex, preloadImage, readyItems]);

  const onPopupKeyDownCapture = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation();
    const requestedIndex = requestedIndexRef.current ?? activeIndex;
    if (requestedIndex === null) return;
    void goTo(requestedIndex + (event.key === "ArrowLeft" ? -1 : 1));
  };

  return (
    <>
      {items.length === 0 ? (
        <div id={id} className="flex min-h-48 items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">Contoh sajian akan ditampilkan di sini.</p>
        </div>
      ) : (
        <div id={id} className={gridClassName}>
          {items.map((item) => {
            const isReady = item.status === "ready" && Boolean(item.imageSrc);
            const itemGridClassName = isTeaser ? "aspect-[4/3]" : item.gridClassName;

            if (!isReady) {
              return (
                <div key={item.id} className={`relative overflow-hidden rounded-2xl border border-border bg-card p-4 ${itemGridClassName}`}>
                  <div className="flex h-full flex-col justify-end">
                    <p className="text-xs font-bold tracking-[0.08em] text-emerald-800 dark:text-emerald-300">Dokumentasi menyusul</p>
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
                  loading="lazy"
                  sizes={isTeaser ? "(max-width: 767px) 50vw, (max-width: 1023px) calc((100vw - 5rem) / 3), (max-width: 1279px) calc((100vw - 7rem) / 4), 292px" : (item.sizes ?? "(max-width: 767px) 50vw, (max-width: 1023px) 34vw, 292px")}
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

      <Dialog.Root open={Boolean(activeItem)} onOpenChange={(open) => {
        if (!open) closeImage();
      }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#062d22]/95" />
          <Dialog.Viewport className="fixed inset-0 z-50">
            <Dialog.Popup onKeyDownCapture={onPopupKeyDownCapture} className="relative h-[100dvh] w-full overflow-hidden bg-[#062d22] text-white outline-none">
              {activeItem?.imageSrc && activeIndex !== null && (
                <>
                  <header className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-6">
                    <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3">
                      <div className="min-w-0 rounded-2xl border border-white/10 bg-emerald-950/70 px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                        <Dialog.Title className="truncate text-sm font-bold text-white sm:text-base">{activeItem.title}</Dialog.Title>
                        <Dialog.Description className="mt-0.5 text-xs text-emerald-100/75">{activeIndex + 1} dari {readyItems.length}</Dialog.Description>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <a
                          href={activeItem.imageSrc}
                          download
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
                        >
                          <Download className="size-4" aria-hidden="true" />
                          <span className="hidden sm:inline">Simpan gambar asli</span>
                          <span className="sr-only sm:hidden">Simpan gambar asli</span>
                        </a>
                        <Dialog.Close ref={closeButtonRef} className={iconButtonClass} aria-label="Tutup foto" title="Tutup foto">
                          <X className="size-5" aria-hidden="true" />
                        </Dialog.Close>
                      </div>
                    </div>
                  </header>

                  <div className="flex h-full w-full items-center justify-center overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
                    <div className="flex items-center justify-center" style={{ width: "calc(100vw - 24px)", height: "calc(100dvh - 104px)" }}>
                      <Image
                        src={activeItem.imageSrc}
                        alt={activeItem.alt}
                        width={1600}
                        height={1200}
                        sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1521px) 92vw, 1400px"
                        className="h-full w-full select-none object-contain transition-transform duration-200 motion-reduce:transition-none"
                        style={{ transform: `scale(${zoom})` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { if (activeIndex !== null) void goTo((requestedIndexRef.current ?? activeIndex) - 1); }}
                    disabled={!canGoPrevious}
                    className={`${iconButtonClass} absolute left-3 top-1/2 z-20 -translate-y-1/2 sm:left-6`}
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="size-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (activeIndex !== null) void goTo((requestedIndexRef.current ?? activeIndex) + 1); }}
                    disabled={!canGoNext}
                    className={`${iconButtonClass} absolute right-3 top-1/2 z-20 -translate-y-1/2 sm:right-6`}
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="size-6" aria-hidden="true" />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-6">
                    <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-emerald-950/75 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-sm">
                      <button type="button" onClick={() => setBoundedZoom(zoom - ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} className={iconButtonClass} aria-label="Perkecil gambar">
                        <ZoomOut className="size-5" aria-hidden="true" />
                      </button>
                      <span className="min-w-16 px-2 text-center text-sm font-bold tabular-nums text-white" aria-live="polite">{Math.round(zoom * 100)}%</span>
                      <button type="button" onClick={() => setBoundedZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} className={iconButtonClass} aria-label="Perbesar gambar">
                        <ZoomIn className="size-5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => setZoom(MIN_ZOOM)} disabled={zoom === MIN_ZOOM} className={iconButtonClass} aria-label="Atur ulang zoom">
                        <RotateCcw className="size-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
