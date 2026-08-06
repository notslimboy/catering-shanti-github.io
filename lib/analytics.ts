type AnalyticsEvent =
  | "whatsapp_click"
  | "package_selected"
  | "form_started"
  | "order_saved"
  | "whatsapp_handoff"
  | "order_fallback";

type AnalyticsParams = Record<string, string | number | boolean>;

export function trackEvent(event: AnalyticsEvent, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = (window as Window & {
    gtag?: (command: string, event: string, params: AnalyticsParams) => void;
  }).gtag;
  gtag?.("event", event, params);
}
