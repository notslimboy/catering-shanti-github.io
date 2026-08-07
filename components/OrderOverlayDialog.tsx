"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { OrderForm } from "@/components/OrderForm";
import { OrderSelectionSummary } from "@/components/OrderSelectionSummary";
import type { PublicMenuItem, PublicPackage } from "@/lib/catalog";
import type { OrderIntent } from "@/lib/order-intent";

type OrderOverlayDialogProps = {
  menuItems: PublicMenuItem[];
  packages: PublicPackage[];
  intent: OrderIntent;
};

export function OrderOverlayDialog({ menuItems, packages, intent }: OrderOverlayDialogProps) {
  const router = useRouter();

  const closeOverlay = () => {
    router.back();
  };

  return (
    <Dialog.Root open disablePointerDismissal onOpenChange={(open) => {
      if (!open) closeOverlay();
    }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-emerald-950/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
          <Dialog.Popup className="max-h-[calc(100dvh-0.5rem)] w-full overflow-y-auto overscroll-contain rounded-t-2xl border-x border-t border-border bg-background shadow-[0_-20px_56px_rgba(6,78,59,0.18)] outline-none transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full motion-reduce:translate-y-0 motion-reduce:transition-none sm:max-h-[min(52rem,calc(100dvh-2rem))] sm:max-w-xl lg:max-w-2xl">
            <div className="mx-auto min-h-full w-full max-w-2xl px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-7 sm:pb-8 sm:pt-5 lg:px-8">
              <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
              <header className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Dialog.Close className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-emerald-800 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:text-emerald-300 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke pilihan
                  </Dialog.Close>
                  <Dialog.Title className="mt-1 text-xl font-bold tracking-tight text-foreground">Form pemesanan</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                    Lengkapi detail acara. Setelah tersimpan, pesanan dilanjutkan melalui WhatsApp.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-emerald-700/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background" aria-label="Tutup formulir pemesanan">
                  <X className="size-5" aria-hidden="true" />
                </Dialog.Close>
              </header>

              <OrderSelectionSummary intent={intent} className="mt-7" />
              <div className="mt-5">
                <OrderForm
                  menuItems={menuItems}
                  packages={packages}
                  initialSelection={intent}
                  source={`pesan_${intent.source}`}
                  draftKey="shanti-order-draft-pesan"
                />
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
