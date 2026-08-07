"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { EventPackageGuide } from "@/lib/event-package-guides";

type EventPackageGuideCardProps = {
  guide: EventPackageGuide;
  className?: string;
  compactOnMobile?: boolean;
};

export function EventPackageGuideCard({ guide, className = "", compactOnMobile = false }: EventPackageGuideCardProps) {
  const mobileClasses = compactOnMobile
    ? {
        article: "rounded-xl lg:rounded-2xl",
        image: "aspect-square lg:aspect-[5/3]",
        content: "p-3 lg:p-5 xl:p-6",
        title: "text-base lg:text-xl",
        description: "hidden lg:block",
        link: "min-h-11 pt-2 lg:pt-5",
        sizes: "50vw",
      }
    : {
        article: "",
        image: "aspect-[5/3]",
        content: "p-5 sm:p-6",
        title: "text-xl",
        description: "",
        link: "pt-5",
        sizes: "(max-width: 767px) 100vw, (max-width: 1279px) 33vw, 395px",
      };

  return (
    <article className={`group flex self-stretch flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:border-emerald-600/35 hover:shadow-[0_14px_36px_rgba(6,78,59,0.10)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] ${mobileClasses.article} ${className}`}>
      <div className={`relative overflow-hidden ${mobileClasses.image}`}>
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          loading="lazy"
          sizes={mobileClasses.sizes}
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
          style={{ objectPosition: guide.imagePosition }}
        />
      </div>
      <div className={`flex flex-1 flex-col ${mobileClasses.content}`}>
        <h3 className={`${mobileClasses.title} font-bold tracking-tight text-foreground`}>{guide.title}</h3>
        <p className={`mt-2 text-sm leading-6 text-muted-foreground ${mobileClasses.description}`}>{guide.description}</p>
        <Link
          href={`/pesan?intent=custom&event=${encodeURIComponent(guide.slug)}`}
          onClick={() => trackEvent("package_selected", { selection_type: "event_guide", selection_id: guide.slug, source: "event_package_guide", page: window.location.pathname })}
          className={`mt-auto inline-flex w-fit items-center gap-1 rounded-lg text-sm font-bold text-emerald-800 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-300 ${mobileClasses.link}`}
        >
          Pilih kebutuhan <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
