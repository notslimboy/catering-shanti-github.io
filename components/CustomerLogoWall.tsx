"use client";

import { useState } from "react";
import { CUSTOMER_ORGANIZATIONS, type CustomerOrganization } from "@/lib/public-content";
import { CustomerLogoTooltip } from "@/components/CustomerLogoTooltip";

const logoScaleClasses = {
  large: "[&>button]:p-2 [&>button>img]:max-h-16 sm:[&>button]:p-3 sm:[&>button>img]:max-h-20",
  medium: "[&>button]:p-2 [&>button>img]:max-h-14 sm:[&>button]:p-3 sm:[&>button>img]:max-h-[4.5rem]",
  largeMark: "[&>button]:p-2 [&>button>img]:!h-16 [&>button>img]:!w-16 sm:[&>button]:p-3 sm:[&>button>img]:!h-20 sm:[&>button>img]:!w-20",
  prominentEmblem: "[&>button]:p-2 [&>button>img]:!h-20 [&>button>img]:!w-20 [&>button>img]:!max-h-20 sm:[&>button]:p-3 sm:[&>button>img]:!h-[5.75rem] sm:[&>button>img]:!w-[5.75rem] sm:[&>button>img]:!max-h-[5.75rem]",
  prominentShield: "[&>button]:p-2 [&>button>img]:!h-[4.75rem] [&>button>img]:!w-[4.75rem] [&>button>img]:!max-h-[4.75rem] sm:[&>button]:p-3 sm:[&>button>img]:!h-[5.5rem] sm:[&>button>img]:!w-[5.5rem] sm:[&>button>img]:!max-h-[5.5rem]",
  prominentUniversityMark: "[&>button]:p-2 [&>button>img]:!h-20 [&>button>img]:!w-20 [&>button>img]:!max-h-20 sm:[&>button]:p-3 sm:[&>button>img]:!h-[5.75rem] sm:[&>button>img]:!w-[5.75rem] sm:[&>button>img]:!max-h-[5.75rem]",
  portraitCrest: "[&>button]:p-2 [&>button>img]:!h-[4.75rem] [&>button>img]:!w-[4.75rem] [&>button>img]:!max-h-[4.75rem] sm:[&>button]:p-3 sm:[&>button>img]:!h-[5.5rem] sm:[&>button>img]:!w-[5.5rem] sm:[&>button>img]:!max-h-[5.5rem]",
  wideWordmark: "[&>button]:p-1 [&>button>img]:!w-[9.5rem] sm:[&>button]:p-1 sm:[&>button>img]:!w-[12.25rem]",
} as const;

type CustomerLogoWallProps = {
  customers?: CustomerOrganization[];
};

export function CustomerLogoWall({ customers = CUSTOMER_ORGANIZATIONS }: CustomerLogoWallProps) {
  const [activeCustomerIds, setActiveCustomerIds] = useState<Set<string>>(() => new Set());
  const isPaused = activeCustomerIds.size > 0;

  const handleCustomerActivity = (customerId: string, isActive: boolean) => {
    setActiveCustomerIds((current) => {
      const next = new Set(current);
      if (isActive) {
        next.add(customerId);
      } else {
        next.delete(customerId);
      }
      return next;
    });
  };

  const renderTrack = (isDuplicate = false) => (
    <ul
      aria-hidden={isDuplicate || undefined}
      aria-label={isDuplicate ? undefined : "Institusi yang pernah dilayani"}
      className="customer-logo-marquee-track flex w-max shrink-0 items-center gap-3 px-1 sm:gap-4"
    >
      {customers.map((customer) => (
        <li
          key={`${isDuplicate ? "duplicate-" : ""}${customer.id}`}
          className={`w-[168px] shrink-0 sm:w-[208px] ${customer.logoScale ? logoScaleClasses[customer.logoScale] : ""}`}
        >
          <CustomerLogoTooltip
            customer={customer}
            tabIndex={isDuplicate ? -1 : undefined}
            onActivityChange={(isActive) => handleCustomerActivity(customer.id, isActive)}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section id="customer-kami" aria-labelledby="client-kami-title" className="overflow-hidden bg-emerald-950 py-12 text-emerald-50 sm:py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 id="client-kami-title" className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
            Dipercaya berbagai institusi
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/80 sm:text-base">
            Dari kampus hingga perusahaan, Shanti Catering hadir untuk berbagai kebutuhan acara.
          </p>
        </div>
      </div>

      <div className="relative mt-7 py-10 sm:mt-8 sm:py-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-emerald-950 to-transparent sm:w-20" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-emerald-950 to-transparent sm:w-20" aria-hidden="true" />
        <div className="overflow-x-clip overflow-y-visible pl-12 sm:pl-24">
          <div className="customer-logo-marquee flex w-max items-center" data-paused={isPaused ? "true" : "false"}>
            {renderTrack()}
            {renderTrack(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
