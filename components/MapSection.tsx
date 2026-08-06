import { Clock, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { WA_URL } from "@/constants/config";

const MAPS_URL = "https://maps.app.goo.gl/L1ep6K4oL1X7Kffv5";
const ADDRESS = "Jl. Bhaskara III No. 38, Kalisari, Kec. Mulyorejo, Surabaya, Jawa Timur 60112";

export function MapSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="p-6 sm:p-8 md:p-10">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Lokasi & kontak</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground">Dapur Shanti Catering di Mulyorejo, Surabaya</h2>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">Tanyakan menu, jumlah porsi, tanggal, dan lokasi pengantaran lewat WhatsApp.</p>

          <div className="mt-8 space-y-5 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
              <p className="leading-6 text-foreground">{ADDRESS}</p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
              <div className="leading-6 text-foreground">
                <p>Senin sampai Jumat: 08.00-21.00</p>
                <p>Sabtu dan Minggu: 08.00-21.00</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-card">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Tanya menu lewat WhatsApp
            </a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-700/25 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:text-emerald-200 dark:hover:bg-emerald-950/40 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-card">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Buka di Google Maps
            </a>
          </div>
        </div>
        <div className="relative min-h-[320px] border-t border-border md:border-l md:border-t-0">
          <iframe title="Lokasi Shanti Catering di Mulyorejo" src={`https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed&hl=id&z=16`} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </div>
    </section>
  );
}
