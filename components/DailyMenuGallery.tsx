"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Download, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { WhatsAppBrandIcon } from "@/components/icons/WhatsAppIcon";
import type { DailyMenuGalleryEntry } from "@/lib/daily-menu-gallery";

type DailyMenuGalleryProps = {
  items: readonly DailyMenuGalleryEntry[];
};

type Point = { x: number; y: number };
type Pan = { x: number; y: number };

const MIN_ZOOM = 1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

const iconButtonClass = "inline-flex size-11 items-center justify-center rounded-full bg-emerald-950/75 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 disabled:cursor-not-allowed disabled:opacity-35";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function DailyMenuGallery({ items }: DailyMenuGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [canUseNativeShare, setCanUseNativeShare] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{ point: Point; pan: Pan } | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex] ?? null;
  const canGoPrevious = activeIndex !== null && activeIndex > 0;
  const canGoNext = activeIndex !== null && activeIndex < items.length - 1;
  const shareActionLabel = canUseNativeShare ? "Bagikan atau simpan gambar" : "Simpan gambar asli";

  useEffect(() => {
    const supportsTouch = navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
    setCanUseNativeShare(supportsTouch && typeof navigator.share === "function" && typeof navigator.canShare === "function");
  }, []);

  const clampPan = (nextPan: Pan, nextZoom = zoom) => {
    const viewport = viewportRef.current?.getBoundingClientRect();
    const image = imageRef.current?.getBoundingClientRect();
    if (!viewport || !image) return nextPan;

    const baseWidth = image.width / zoom;
    const baseHeight = image.height / zoom;
    const maxX = Math.max(0, (baseWidth * nextZoom - viewport.width) / 2);
    const maxY = Math.max(0, (baseHeight * nextZoom - viewport.height) / 2);
    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    };
  };

  const setBoundedZoom = (nextZoom: number) => {
    const boundedZoom = clamp(Math.round(nextZoom * 100) / 100, MIN_ZOOM, MAX_ZOOM);
    setZoom(boundedZoom);
    setPan((currentPan) => clampPan(currentPan, boundedZoom));
  };

  const openPoster = (index: number, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setPan({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);
    setActiveIndex(index);
  };

  const closePoster = () => setActiveIndex(null);

  const downloadOriginal = (item: DailyMenuGalleryEntry) => {
    const link = document.createElement("a");
    link.href = item.sourceUrl;
    link.download = item.downloadFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const shareOriginal = async (event: ReactMouseEvent<HTMLAnchorElement>, item: DailyMenuGalleryEntry) => {
    if (!canUseNativeShare) return;

    event.preventDefault();
    try {
      const response = await fetch(item.sourceUrl);
      if (!response.ok) throw new Error("Gambar tidak dapat dimuat.");

      const image = await response.blob();
      const file = new File([image], item.downloadFilename, { type: image.type || "image/png" });
      const shareData = {
        title: item.title,
        text: `Poster ${item.title} dari Shanti Catering.`,
        files: [file],
      };

      if (!navigator.canShare({ files: [file] })) {
        downloadOriginal(item);
        return;
      }

      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      downloadOriginal(item);
    }
  };

  const goTo = useCallback((nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setPan({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);
    setActiveIndex(nextIndex);
  }, [items.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    closeButtonRef.current?.focus();
    return () => openerRef.current?.focus();
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, goTo]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      pinchRef.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        zoom,
      };
      dragStartRef.current = null;
      return;
    }

    if (zoom > MIN_ZOOM) {
      dragStartRef.current = { point: { x: event.clientX, y: event.clientY }, pan };
      setIsPanning(true);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      setBoundedZoom(pinchRef.current.zoom * (distance / pinchRef.current.distance));
      return;
    }

    if (!dragStartRef.current || zoom === MIN_ZOOM) return;
    const nextPan = {
      x: dragStartRef.current.pan.x + event.clientX - dragStartRef.current.point.x,
      y: dragStartRef.current.pan.y + event.clientY - dragStartRef.current.point.y,
    };
    setPan(clampPan(nextPan));
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    dragStartRef.current = null;
    pinchRef.current = null;
    setIsPanning(false);
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setBoundedZoom(zoom + (event.deltaY < 0 ? 0.1 : -0.1));
  };

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={(event) => openPoster(index, event.currentTarget)}
              className="group block w-full bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-inset"
              aria-label={`Buka poster ${item.title}`}
            >
              <span className="relative block aspect-[1414/2000] w-full overflow-hidden">
                <Image
                  src={item.previewUrl}
                  alt={item.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), (max-width: 1279px) calc(33vw - 2rem), 400px"
                  className="object-contain transition duration-300 group-hover:scale-[1.015] motion-reduce:transition-none"
                />
              </span>
            </button>
            <div className="flex flex-col items-start gap-1 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
              <h3 className="text-base font-bold text-foreground">{item.title}</h3>
              <a
                href={item.sourceUrl}
                download={item.downloadFilename}
                onClick={(event) => void shareOriginal(event, item)}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:text-emerald-300 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background"
              >
                <Download className="size-4" aria-hidden="true" />
                {shareActionLabel}
              </a>
            </div>
          </article>
        ))}

        <article className="overflow-hidden rounded-2xl border border-border bg-card" aria-label="Tanya menu catering harian">
          <div className="relative flex aspect-[1414/2250] flex-col justify-between overflow-hidden p-6 sm:p-7">
            <div className="pointer-events-none absolute right-0 top-0 size-24 translate-x-8 -translate-y-8 rounded-full bg-orange-300/35" aria-hidden="true" />
            <div className="relative">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Catering rutin untuk rumah &amp; kantor</p>
              <h3 className="mt-5 max-w-[11ch] text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-4xl lg:text-3xl">Menu harian, tinggal terima.</h3>
              <p className="mt-5 max-w-[31ch] text-sm leading-6 text-muted-foreground">Kirim jumlah porsi dan alamat. Kami bantu cek menu serta jadwal antar untuk minggu ini.</p>
            </div>
            <WhatsAppCta
              placement="daily_catering_weekly_catalog"
              className="relative mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition-[background-color,transform,box-shadow] duration-200 ease-out hover:bg-emerald-800 hover:shadow-[0_8px_18px_rgba(6,78,59,0.18)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <WhatsAppBrandIcon className="size-4" /> Tanya menu hari ini
            </WhatsAppCta>
          </div>
        </article>
      </div>

      <Dialog.Root open={Boolean(activeItem)} onOpenChange={(open) => {
        if (!open) closePoster();
      }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-emerald-950/95" />
          <Dialog.Viewport className="fixed inset-0 z-50">
            <Dialog.Popup className="relative h-[100dvh] w-full overflow-hidden bg-emerald-950 text-white outline-none">
              {activeItem && activeIndex !== null && (
                <>
                  <header className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-6">
                    <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3">
                      <div className="min-w-0 rounded-2xl bg-emerald-950/75 px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                        <Dialog.Title className="truncate text-sm font-bold text-white sm:text-base">{activeItem.title}</Dialog.Title>
                        <Dialog.Description className="mt-0.5 text-xs text-emerald-100/75">{activeIndex + 1} dari {items.length}</Dialog.Description>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <a
                          href={activeItem.sourceUrl}
                          download={activeItem.downloadFilename}
                          onClick={(event) => void shareOriginal(event, activeItem)}
                          className={`${iconButtonClass} w-auto gap-2 px-3`}
                          aria-label={shareActionLabel}
                          title={shareActionLabel}
                        >
                          <Download className="size-5" aria-hidden="true" />
                          <span className="hidden sm:inline">{shareActionLabel}</span>
                        </a>
                        <Dialog.Close ref={closeButtonRef} className={iconButtonClass} aria-label="Close viewer" title="Close viewer">
                          <X className="size-5" aria-hidden="true" />
                        </Dialog.Close>
                      </div>
                    </div>
                  </header>

                  <div
                    ref={viewportRef}
                    className={`flex h-full w-full touch-none items-center justify-center overflow-hidden px-3 pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+5rem))] pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))] sm:px-24 sm:pb-28 sm:pt-24 ${zoom > MIN_ZOOM ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"}`}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerEnd}
                    onPointerCancel={onPointerEnd}
                    onWheel={onWheel}
                  >
                    <Image
                      ref={imageRef}
                      src={activeItem.sourceUrl}
                      alt={activeItem.alt}
                      width={1414}
                      height={2000}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 70vw, 640px"
                      draggable={false}
                      className={`h-auto w-full max-h-full select-none object-contain sm:w-auto sm:max-w-full ${isPanning ? "" : "transition-transform duration-200 motion-reduce:transition-none"}`}
                      style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    disabled={!canGoPrevious}
                    className={`${iconButtonClass} absolute left-3 top-1/2 z-20 -translate-y-1/2 sm:left-6`}
                    aria-label="Poster sebelumnya"
                  >
                    <ChevronLeft className="size-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    disabled={!canGoNext}
                    className={`${iconButtonClass} absolute right-3 top-1/2 z-20 -translate-y-1/2 sm:right-6`}
                    aria-label="Poster berikutnya"
                  >
                    <ChevronRight className="size-6" aria-hidden="true" />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-6">
                    <div className="flex items-center gap-1 rounded-2xl bg-emerald-950/80 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-sm">
                      <button type="button" onClick={() => setBoundedZoom(zoom - ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} className={iconButtonClass} aria-label="Zoom out" title="Zoom out">
                        <ZoomOut className="size-5" aria-hidden="true" />
                      </button>
                      <span className="min-w-16 px-2 text-center text-sm font-bold tabular-nums text-white" aria-live="polite">{Math.round(zoom * 100)}%</span>
                      <button type="button" onClick={() => setBoundedZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} className={iconButtonClass} aria-label="Zoom in" title="Zoom in">
                        <ZoomIn className="size-5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => { setZoom(MIN_ZOOM); setPan({ x: 0, y: 0 }); }} disabled={zoom === MIN_ZOOM && pan.x === 0 && pan.y === 0} className={iconButtonClass} aria-label="Reset zoom" title="Reset zoom">
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
