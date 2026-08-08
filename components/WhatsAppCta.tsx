"use client";

import { ComponentProps, ReactNode } from "react";
import { WA_URL } from "@/constants/config";
import { trackEvent } from "@/lib/analytics";

interface WhatsAppCtaProps extends Omit<ComponentProps<"a">, "href"> {
  children: ReactNode;
  placement: string;
  href?: string;
}

export function WhatsAppCta({ children, placement, href = WA_URL, onClick, ...props }: WhatsAppCtaProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        trackEvent("whatsapp_click", { placement });
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
