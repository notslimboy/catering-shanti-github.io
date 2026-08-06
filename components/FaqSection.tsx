"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { FAQ_ITEMS, type FaqItem } from "@/lib/public-content";

type FaqSectionProps = {
  items?: FaqItem[];
};

export function FaqSection({ items = FAQ_ITEMS }: FaqSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [openItemIds, setOpenItemIds] = useState<string[]>([]);
  const easing = [0.22, 1, 0.36, 1] as const;
  const immediateTransition = { duration: 0 };
  const panelVariants = {
    closed: {
      height: 0,
      opacity: 0,
      y: -2,
      transition: shouldReduceMotion
        ? immediateTransition
        : {
            height: { duration: 0.16, ease: easing },
            opacity: { duration: 0.12, ease: easing },
            y: { duration: 0.12, ease: easing },
          },
    },
    open: {
      height: "auto",
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? immediateTransition
        : {
            height: { duration: 0.2, ease: easing },
            opacity: { duration: 0.12, ease: easing },
            y: { duration: 0.12, ease: easing },
          },
    },
  };

  const toggleItem = (itemId: string) => {
    setOpenItemIds((currentIds) =>
      currentIds.includes(itemId) ? currentIds.filter((id) => id !== itemId) : [...currentIds, itemId],
    );
  };

  return (
    <section id="faq" className="border-y border-border bg-muted/35 py-16 sm:py-20 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-12 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Yang sering ditanyakan</h2>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">Masih ada yang ingin ditanyakan? Kirim menu, porsi, tanggal, dan lokasi lewat WhatsApp.</p>
          <WhatsAppCta
            placement="faq"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-background active:translate-y-px"
          >
            Tanya menu lewat WhatsApp
          </WhatsAppCta>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((item, index) => {
            const isOpen = openItemIds.includes(item.id);
            const panelId = `faq-panel-${item.id}`;

            return (
              <div key={item.id} className={`px-5 sm:px-6 ${index > 0 ? "border-t border-border" : ""}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.id)}
                  className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-5 rounded-lg py-4 text-left text-base font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-card"
                >
                  <span>{item.question}</span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={shouldReduceMotion ? immediateTransition : { duration: 0.18, ease: easing }}
                    className="shrink-0 text-emerald-700 dark:text-emerald-300"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={panelVariants}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-5 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
