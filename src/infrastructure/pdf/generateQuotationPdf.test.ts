import { describe, expect, it } from "vitest";
import { generateQuotationPdf } from "./generateQuotationPdf";

describe("generateQuotationPdf", () => {
  it("gera um PDF A4 com uma página e conteúdo", async () => {
    const pdf = await generateQuotationPdf({
      seller: {
        name: "Ateliê 3D",
        email: "contato@example.com",
        phone: "(71) 99999-9999",
        document: "",
        brandColor: "#2563EB",
      },
      clientName: "Maria",
      clientContact: "maria@example.com",
      projectTitle: "Suportes personalizados",
      quantity: 20,
      unitPrice: 9,
      validityDays: 7,
      productionLeadTime: 8,
      productionLeadTimeUnit: "business-days",
      paymentMethods: ["pix", "credit-card"],
      pixKey: "contato@example.com",
      upfrontPercentage: 50,
      includeCareInstructions: true,
      notes: "Produção iniciada após aprovação.",
      productImageDataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=",
      issuedAt: new Date(2026, 6, 25, 10, 30),
    });

    const bytes = pdf.output("arraybuffer");

    expect(pdf.getNumberOfPages()).toBe(1);
    expect(bytes.byteLength).toBeGreaterThan(3_000);
    expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(210, 0);
    expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(297, 0);
  });
});
