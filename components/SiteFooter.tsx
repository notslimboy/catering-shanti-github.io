import Link from "next/link";
import { WhatsAppCta } from "@/components/WhatsAppCta";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>Shanti Catering. Mulyorejo, Surabaya.</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/menu" className="font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300">Paket &amp; menu</Link>
          <Link href="/galeri" className="font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300">Galeri acara</Link>
          <Link href="/catering-harian" className="font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300">Catering harian</Link>
          <WhatsAppCta placement="footer" className="font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300">WhatsApp</WhatsAppCta>
        </div>
      </div>
    </footer>
  );
}
