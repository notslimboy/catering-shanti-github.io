"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { getAllPackageCollections } from "@/lib/package-catalogue";

const navigation = [
  { href: "/", label: "Beranda" },
  { href: "/menu", label: "Paket & menu" },
  { href: "/galeri", label: "Katalog" },
  { href: "/catering-harian", label: "Catering harian" },
] as const;

function isCurrentPath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

const packageCollections = getAllPackageCollections();

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPackageMenuOpen, setIsPackageMenuOpen] = useState(false);
  const [isMobilePackageMenuOpen, setIsMobilePackageMenuOpen] = useState(false);
  const packageMenuRef = useRef<HTMLDivElement | null>(null);
  const packageMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const firstPackageLinkRef = useRef<HTMLAnchorElement | null>(null);
  const isPackageMenuCurrent = pathname === "/menu" || pathname.startsWith("/paket-menu");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (isPackageMenuOpen) {
        event.preventDefault();
        setIsPackageMenuOpen(false);
        packageMenuTriggerRef.current?.focus();
      }
      setIsMenuOpen(false);
      setIsMobilePackageMenuOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!packageMenuRef.current?.contains(event.target as Node)) {
        setIsPackageMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isPackageMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/84">
      <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Beranda Shanti Catering"
          className="flex min-h-11 min-w-11 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-emerald-950/5">
            <Image src="/images/logo catering.png" alt="Shanti Catering" fill sizes="36px" className="object-contain p-0.5" loading="eager" />
          </span>
          <span className="hidden truncate text-sm font-bold tracking-tight text-foreground min-[420px]:inline sm:text-base">Shanti Catering</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-0.5 lg:flex">
          {navigation.map((item) => {
            const isCurrent = isCurrentPath(pathname, item.href);
            if (item.href === "/menu") {
              return (
                <div key={item.href} ref={packageMenuRef} className="relative">
                  <div className="flex items-center">
                    <Link
                      href="/menu"
                      aria-current={isCurrent ? "page" : undefined}
                      onClick={() => setIsPackageMenuOpen(false)}
                      className={`inline-flex min-h-11 items-center rounded-l-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                      isPackageMenuCurrent
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                        : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
                    }`}
                  >
                      {item.label}
                    </Link>
                    <button
                      ref={packageMenuTriggerRef}
                      type="button"
                      aria-label={isPackageMenuOpen ? "Tutup koleksi paket" : "Buka koleksi paket"}
                      aria-haspopup="menu"
                      aria-expanded={isPackageMenuOpen}
                      aria-controls="package-collections-menu"
                      onClick={() => setIsPackageMenuOpen((open) => !open)}
                      onKeyDown={(event) => {
                        if (event.key !== "ArrowDown") return;
                        event.preventDefault();
                        setIsPackageMenuOpen(true);
                        requestAnimationFrame(() => firstPackageLinkRef.current?.focus());
                      }}
                      className={`inline-flex size-11 items-center justify-center rounded-r-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                        isPackageMenuCurrent
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                          : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
                      }`}
                    >
                      <ChevronDown className={`size-4 transition-transform ${isPackageMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                  </div>
                  {isPackageMenuOpen && (
                    <div id="package-collections-menu" role="menu" aria-label="Koleksi paket" className="absolute left-0 top-[calc(100%+0.5rem)] grid w-[34rem] grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-emerald-950/10">
                      {packageCollections.map((collection, index) => {
                        const isCollectionCurrent = pathname.startsWith(`/paket-menu/${collection.slug}`);
                        return (
                          <Link
                            key={collection.id}
                            ref={index === 0 ? firstPackageLinkRef : undefined}
                            role="menuitem"
                            href={`/paket-menu/${collection.slug}`}
                            aria-current={isCollectionCurrent ? "page" : undefined}
                            onClick={() => setIsPackageMenuOpen(false)}
                            className={`rounded-xl px-3 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                              isCollectionCurrent
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {collection.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                  isCurrent
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/pesan"
            onClick={() => {
              setIsMenuOpen(false);
              setIsMobilePackageMenuOpen(false);
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-3 text-sm font-bold text-white shadow-sm shadow-emerald-950/15 transition hover:bg-emerald-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:px-4"
          >
            Pesan
          </Link>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            aria-label="Ganti tema"
            suppressHydrationWarning
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => {
              if (open) setIsMobilePackageMenuOpen(false);
              return !open;
            })}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 lg:hidden"
            aria-label={isMenuOpen ? "Tutup navigasi" : "Buka navigasi"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Navigasi utama mobile"
            className="absolute right-4 top-[calc(100%+0.5rem)] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-2 shadow-xl shadow-emerald-950/10 sm:right-6 lg:hidden"
          >
            <div className="grid gap-1">
              {navigation.map((item) => {
                const isCurrent = isCurrentPath(pathname, item.href);
                if (item.href === "/menu") {
                  return (
                    <div key={item.href} className="rounded-xl bg-muted/55 p-1">
                      <div className="flex items-center">
                        <Link
                          href="/menu"
                          aria-current={isCurrent ? "page" : undefined}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsMobilePackageMenuOpen(false);
                          }}
                          className={`flex min-h-11 flex-1 items-center rounded-l-lg px-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                          isPackageMenuCurrent ? "text-emerald-800 dark:text-emerald-200" : "text-foreground"
                        }`}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          aria-label={isMobilePackageMenuOpen ? "Tutup koleksi paket" : "Buka koleksi paket"}
                          aria-haspopup="menu"
                          aria-expanded={isMobilePackageMenuOpen}
                          aria-controls="mobile-package-collections"
                          onClick={() => setIsMobilePackageMenuOpen((open) => !open)}
                          className={`inline-flex size-11 items-center justify-center rounded-r-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                            isPackageMenuCurrent ? "text-emerald-800 dark:text-emerald-200" : "text-foreground"
                          }`}
                        >
                          <ChevronDown className={`size-4 transition-transform ${isMobilePackageMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                        </button>
                      </div>
                      {isMobilePackageMenuOpen && (
                        <div id="mobile-package-collections" role="menu" aria-label="Koleksi paket" className="grid grid-cols-2 gap-1 border-t border-border/70 pt-1">
                          {packageCollections.map((collection) => {
                            const isCollectionCurrent = pathname.startsWith(`/paket-menu/${collection.slug}`);
                            return (
                              <Link
                                key={collection.id}
                                role="menuitem"
                                href={`/paket-menu/${collection.slug}`}
                                aria-current={isCollectionCurrent ? "page" : undefined}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setIsMobilePackageMenuOpen(false);
                                }}
                                className={`flex min-h-11 items-center rounded-lg px-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                                  isCollectionCurrent
                                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                                }`}
                              >
                                {collection.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsMobilePackageMenuOpen(false);
                    }}
                    className={`rounded-xl px-3.5 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                      isCurrent
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
