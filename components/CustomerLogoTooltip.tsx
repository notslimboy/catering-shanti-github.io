"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { CustomerOrganization } from "@/lib/public-content";

type CustomerLogoTooltipProps = {
  customer: CustomerOrganization;
};

export function CustomerLogoTooltip({ customer }: CustomerLogoTooltipProps) {
  const tooltipId = `customer-logo-tooltip-${useId().replace(/:/g, "")}`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const placementFrameRef = useRef<number | null>(null);
  const touchPointerRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [escapeDismissed, setEscapeDismissed] = useState(false);
  const [placement, setPlacement] = useState<"above" | "below">("above");

  useEffect(() => {
    if (!open) return;

    const updatePlacement = () => {
      const button = buttonRef.current?.getBoundingClientRect();
      const tooltip = tooltipRef.current?.getBoundingClientRect();
      if (!button || !tooltip) return;

      const nextPlacement = button.top < tooltip.height + 8 ? "below" : "above";
      setPlacement((current) => (current === nextPlacement ? current : nextPlacement));
    };

    const schedulePlacement = () => {
      if (placementFrameRef.current !== null) return;

      placementFrameRef.current = window.requestAnimationFrame(() => {
        placementFrameRef.current = null;
        updatePlacement();
      });
    };

    updatePlacement();
    window.addEventListener("resize", schedulePlacement);
    window.addEventListener("scroll", schedulePlacement, true);
    return () => {
      window.removeEventListener("resize", schedulePlacement);
      window.removeEventListener("scroll", schedulePlacement, true);
      if (placementFrameRef.current !== null) {
        window.cancelAnimationFrame(placementFrameRef.current);
        placementFrameRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideTouch = (event: PointerEvent) => {
      if (event.pointerType === "touch" && !buttonRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideTouch);
    return () => document.removeEventListener("pointerdown", closeOnOutsideTouch);
  }, [open]);

  const showTooltip = () => {
    if (!escapeDismissed) setOpen(true);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={customer.name}
      aria-describedby={open ? tooltipId : undefined}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        if (touchPointerRef.current) return;
        setEscapeDismissed(false);
        setOpen(true);
      }}
      onBlur={() => {
        setEscapeDismissed(false);
        setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setEscapeDismissed(true);
          setOpen(false);
        }
      }}
      onPointerDown={(event) => {
        touchPointerRef.current = event.pointerType === "touch";
      }}
      onPointerUp={(event) => {
        if (event.pointerType === "touch") {
          setEscapeDismissed(false);
          setOpen((current) => !current);
          touchPointerRef.current = false;
        }
      }}
      className={`relative flex h-20 min-h-11 w-full items-center justify-center rounded-2xl border p-4 transition-none hover:border-emerald-700 focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:translate-y-px motion-reduce:transition-none sm:h-24 sm:p-5 ${
        customer.logoSrc ? "border-border bg-white" : "border-border bg-card"
      }`}
    >
      {customer.logoSrc ? (
        <Image
          src={customer.logoSrc}
          alt=""
          aria-hidden="true"
          width={224}
          height={96}
          sizes="(max-width: 639px) 42vw, (max-width: 1023px) 28vw, 18vw"
          className={
            customer.markOnly
              ? "h-11 w-11 object-contain sm:h-14 sm:w-14"
              : "max-h-11 w-auto max-w-full object-contain sm:max-h-14"
          }
        />
      ) : (
        <span aria-hidden="true" className="text-center text-xs font-extrabold leading-tight tracking-[-0.025em] text-foreground sm:text-sm">
          {customer.wordmark}
        </span>
      )}
      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        aria-hidden={!open}
        className={`pointer-events-none absolute left-1/2 z-20 w-max max-w-[272px] -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-center text-xs font-semibold leading-4 text-emerald-900 shadow-[0_8px_20px_-12px_rgb(6_78_59_/_0.32)] transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none motion-reduce:transition-none dark:text-emerald-300 ${
          placement === "above"
            ? `bottom-[calc(100%+8px)] ${open ? "translate-y-0 opacity-100 duration-150" : "translate-y-0.5 opacity-0 duration-100"}`
            : `top-[calc(100%+8px)] ${open ? "translate-y-0 opacity-100 duration-150" : "-translate-y-0.5 opacity-0 duration-100"}`
        }`}
      >
        {customer.wordmark}
        <span
          aria-hidden="true"
          className={`absolute left-1/2 size-2 -translate-x-1/2 rotate-45 border border-border bg-popover ${placement === "above" ? "-bottom-1" : "-top-1"}`}
        />
      </span>
    </button>
  );
}
