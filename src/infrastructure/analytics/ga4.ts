export type Ga4EventName =
  | "quotation_opened"
  | "quotation_pdf_generated"
  | "view_result_clicked";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGa4Event(name: Ga4EventName): void {
  window.gtag?.("event", name);
}
