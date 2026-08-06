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
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 supports-[backdrop-filter]:backdrop-blur-[2px] md:bg-black/20 md:backdrop-blur-none" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-stretch">
          <Dialog.Popup className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background outline-none">
            <header className="shrink-0 border-b border-border bg-card px-5 py-4 sm:px-7 md:px-8">
              <div className="mx-auto flex w-full max-w-[68rem] items-start justify-between gap-4">
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
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6 md:px-8 md:py-10">
              <div className="mx-auto w-full max-w-[68rem]">
                <OrderSelectionSummary intent={intent} />
                <div className="mt-5">
                  <OrderForm
                    menuItems={menuItems}
                    packages={packages}
                    initialSelection={intent}
                    source={`pesan_${intent.source}`}
                    draftKey="shanti-order-draft-pesan"
                    submitFooterTargetId="order-overlay-submit-footer"
                  />
                </div>
              </div>
            </div>
            <footer className="shrink-0 border-t border-border bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_28px_rgba(6,78,59,0.08)] dark:shadow-[0_-10px_28px_rgba(0,0,0,0.24)] sm:px-7 md:px-8 md:pb-4">
              <div id="order-overlay-submit-footer" className="mx-auto w-full max-w-[68rem]" />
            </footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
