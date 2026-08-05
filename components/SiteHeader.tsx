"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const navigation = [
  { href: "/", label: "Beranda" },
  { href: "/menu", label: "Paket & Menu" },
  { href: "/galeri", label: "Galeri Acara" },
  { href: "/catering-harian", label: "Catering Harian" },
] as const;

function isCurrentPath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/84">
      <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Beranda Shanti Catering"
          className="flex min-h-11 min-w-11 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-emerald-950/5">
            <Image src="/images/logo catering.png" alt="Shanti Catering" fill sizes="36px" className="object-contain p-0.5" priority />
          </span>
          <span className="hidden truncate text-sm font-bold tracking-tight text-foreground min-[420px]:inline sm:text-base">Shanti Catering</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-0.5 lg:flex">
          {navigation.map((item) => {
            const isCurrent = isCurrentPath(pathname, item.href);
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
            href="/#pesan"
            onClick={() => setIsMenuOpen(false)}
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
            onClick={() => setIsMenuOpen((open) => !open)}
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
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
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
