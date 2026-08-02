import { describe, expect, it, vi } from "vitest";
import { trackGa4Event } from "./ga4";

describe("trackGa4Event", () => {
  it("sends the event name through gtag when available", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackGa4Event("quotation_opened");

    expect(gtag).toHaveBeenCalledWith("event", "quotation_opened");
  });

  it("does nothing when gtag is unavailable", () => {
    delete window.gtag;

    expect(() => trackGa4Event("quotation_pdf_generated")).not.toThrow();
  });

  it("supports tracking a result navigation click", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackGa4Event("view_result_clicked");

    expect(gtag).toHaveBeenCalledWith("event", "view_result_clicked");
  });
});
