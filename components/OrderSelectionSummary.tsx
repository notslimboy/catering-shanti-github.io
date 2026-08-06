import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { OrderIntent } from "@/lib/order-intent";

type OrderSelectionSummaryProps = {
  intent: OrderIntent;
  className?: string;
};

export function OrderSelectionSummary({ intent, className }: OrderSelectionSummaryProps) {
  return (
    <section className={`rounded-2xl border border-emerald-700/20 bg-emerald-50/60 p-5 dark:bg-emerald-950/25 ${className ?? ""}`} aria-labelledby="selected-choice-heading">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
        <div>
          <p id="selected-choice-heading" className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Pilihan saat ini</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{intent.label}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{intent.description}</p>
          {intent.hasConflict && <p className="mt-2 text-sm font-semibold text-amber-800 dark:text-amber-200">Tautan memiliki lebih dari satu pilihan. Form dimulai dari kebutuhan custom agar detail tidak tertukar.</p>}
          <Link href={intent.browseHref} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-800 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:text-emerald-300 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background">
            Ganti pilihan <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
