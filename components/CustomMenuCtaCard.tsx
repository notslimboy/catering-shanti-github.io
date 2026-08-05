import { WhatsAppCta } from "@/components/WhatsAppCta";
import { WhatsAppBrandIcon } from "@/components/icons/WhatsAppIcon";

type CustomMenuCtaCardProps = {
  placement: string;
};

export function CustomMenuCtaCard({ placement }: CustomMenuCtaCardProps) {
  return (
    <article className="flex min-w-0 flex-col justify-between rounded-2xl border border-emerald-700/30 bg-emerald-50/70 p-4 dark:bg-emerald-950/25 sm:p-5">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-foreground">Punya Preferensi Menu Sendiri?</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Ceritakan kebutuhan acara dan pilihan hidangan Anda. Kami bantu susun menunya.</p>
      </div>
      <WhatsAppCta
        placement={placement}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background"
      >
        <WhatsAppBrandIcon className="h-4 w-4" /> Chat Kami
      </WhatsAppCta>
    </article>
  );
}
