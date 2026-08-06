"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { EventPackageGuide } from "@/lib/event-package-guides";

type EventPackageGuideCardProps = {
  guide: EventPackageGuide;
  className?: string;
};

export function EventPackageGuideCard({ guide, className = "" }: EventPackageGuideCardProps) {
  return (
    <article className={`group flex self-stretch flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:border-emerald-600/35 hover:shadow-[0_14px_36px_rgba(6,78,59,0.10)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] ${className}`}>
      <div className="relative aspect-[5/3] overflow-hidden">
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{guide.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.description}</p>
        <Link
          href={`/pesan?intent=custom&event=${encodeURIComponent(guide.slug)}`}
          onClick={() => trackEvent("package_selected", { selection_type: "event_guide", selection_id: guide.slug, source: "event_package_guide", page: window.location.pathname })}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-5 rounded-lg text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300"
        >
          Pilih kebutuhan <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
