import { describe, expect, it } from "vitest";
import { quotationFormSchema } from "./quotation.schema";

const validQuotation = {
  sellerName: "Ateliê 3D",
  sellerEmail: "contato@example.com",
  sellerPhone: "(71) 99999-9999",
  sellerDocument: "",
  clientName: "Maria",
  clientContact: "",
  projectTitle: "Suportes personalizados",
  quantity: "20",
  validityDays: "7",
  productionLeadTime: "8",
  productionLeadTimeUnit: "business-days",
  paymentMethods: ["pix"],
  pixKey: "contato@example.com",
  upfrontPercentage: "50",
  includeCareInstructions: true,
  notes: "",
};

describe("quotationFormSchema", () => {
  it("normaliza campos e converte quantidade e validade", () => {
    const quotation = quotationFormSchema.parse(validQuotation);

    expect(quotation.sellerName).toBe("Ateliê 3D");
    expect(quotation.quantity).toBe(20);
    expect(quotation.validityDays).toBe(7);
    expect(quotation.productionLeadTime).toBe(8);
    expect(quotation.upfrontPercentage).toBe(50);
  });

  it("rejeita nomes vazios, quantidade zero e validade excessiva", () => {
    const result = quotationFormSchema.safeParse({
      ...validQuotation,
      sellerName: " ",
      quantity: 0,
      validityDays: 366,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["sellerName", "quantity", "validityDays"]),
    );
  });

  it("exige chave quando Pix é selecionado", () => {
    const result = quotationFormSchema.safeParse({
      ...validQuotation,
      pixKey: " ",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.path).toEqual(["pixKey"]);
  });
});
