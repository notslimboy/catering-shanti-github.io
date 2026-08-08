import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { WhatsAppBrandIcon } from "@/components/icons/WhatsAppIcon";

type ClosingCtaAction =
  | { kind: "link"; href: string; label: string }
  | { kind: "whatsapp"; placement: string; label: string; href?: string };

type ClosingCtaProps = {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  primaryAction: ClosingCtaAction;
  secondaryAction?: ClosingCtaAction;
};

const actionClasses = {
  primary: "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:w-auto",
  secondary: "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-700/25 px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:text-emerald-300 dark:hover:bg-emerald-950/40 sm:w-auto",
};

function ClosingCtaAction({ action, priority }: { action: ClosingCtaAction; priority: "primary" | "secondary" }) {
  const className = actionClasses[priority];

  if (action.kind === "whatsapp") {
    return (
      <WhatsAppCta href={action.href} placement={action.placement} className={className}>
        <WhatsAppBrandIcon className="h-4 w-4" /> {action.label}
      </WhatsAppCta>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function ClosingCta({ image, imageAlt, title, description, primaryAction, secondaryAction }: ClosingCtaProps) {
  return (
    <section className="border-t border-border bg-muted/45 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative aspect-[4/3] bg-emerald-950 md:aspect-auto md:min-h-[360px]">
            <Image src={image} alt={imageAlt} fill sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) 45vw, 576px" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10 md:p-12">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ClosingCtaAction action={primaryAction} priority="primary" />
              {secondaryAction && <ClosingCtaAction action={secondaryAction} priority="secondary" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
