import { ExternalLink, Star } from "lucide-react";
import type { GoogleReview, GoogleReviewSummary } from "@/lib/public-content";

type GoogleReviewsSectionProps = {
  reviews: GoogleReview[];
  summary: GoogleReviewSummary;
  available: boolean;
};

function RatingStars({ rating }: { rating: GoogleReview["rating"] }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} dari 5 bintang`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-border"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function GoogleReviewsSection({ reviews, summary, available }: GoogleReviewsSectionProps) {
  const ratingValue = summary.ratingValue ?? Number(summary.rating.replace(",", "."));

  return (
    <section id="ulasan" className="border-y border-border bg-muted/35 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-emerald-950 px-5 py-5 text-white sm:px-6 sm:py-6 lg:px-7">
          <div className="flex flex-col gap-5 md:flex-row md:flex-wrap md:items-center md:justify-between lg:flex-nowrap lg:gap-7">
            <div className="shrink-0">
              <p className="text-sm font-bold text-emerald-200">Ulasan Google Maps</p>
              <div className="mt-1.5 flex items-center gap-3">
                <p className="text-4xl font-bold tracking-[-0.06em] sm:text-5xl">{summary.rating}</p>
                <span className="flex gap-0.5" aria-label={`Rating ${summary.rating} dari 5 bintang`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${index < Math.floor(ratingValue) ? "fill-amber-400 text-amber-400" : index < ratingValue ? "fill-amber-400/45 text-amber-400" : "fill-transparent text-amber-400/45"}`}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              </div>
            </div>

            <div className="border-t border-white/15 pt-4 md:max-w-md md:border-l md:border-t-0 md:pl-6 md:pt-0 lg:flex-1">
              <p className="text-sm font-semibold text-emerald-100">{available ? `dari ${summary.reviewCount} ulasan` : "Snapshot ulasan belum tersedia"}</p>
              <p className="mt-1 text-sm leading-6 text-emerald-100/80">{available ? "Kutipan di bawah diambil dari ulasan pelanggan di Google Maps." : "Lihat profil Google Maps untuk ulasan terbaru."}</p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 border-t border-white/15 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <a
                href={summary.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 active:translate-y-px"
              >
                Lihat semua ulasan
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="text-xs leading-5 text-emerald-100/70">Data Google Maps per {summary.observedAt}.</p>
            </div>
          </div>
        </div>

        {available ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {reviews.map((review) => (
              <article key={review.id} className="flex min-h-44 flex-col rounded-2xl border border-border bg-card p-5 lg:min-h-48">
                <RatingStars rating={review.rating} />
                <blockquote className="mt-3 text-base font-medium leading-7 text-foreground">“{review.quote}”</blockquote>
                <div className="mt-4">
                  <p className="text-sm font-bold text-foreground">{review.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Google Maps, {review.reviewAge}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground">
            Ulasan Google Maps belum tersedia untuk ditampilkan.
          </div>
        )}
      </div>
    </section>
  );
}
