import { z } from "zod";

const trimmedText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} é obrigatório.`)
    .max(maximum, `${label} deve ter no máximo ${maximum} caracteres.`);

export const quotationFormSchema = z
  .object({
    sellerName: trimmedText("Nome do vendedor", 100),
    sellerEmail: z.string().trim().max(120),
    sellerPhone: z.string().trim().max(30),
    sellerDocument: z.string().trim().max(30),
    brandColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor hexadecimal como #BE185D.")
      .transform((color) => color.toUpperCase()),
    clientName: trimmedText("Nome do cliente", 100),
    clientContact: z.string().trim().max(120),
    projectTitle: trimmedText("Descrição do projeto", 140),
    quantity: z.coerce
      .number()
      .int("A quantidade deve ser um número inteiro.")
      .min(1, "A quantidade mínima é 1.")
      .max(10_000, "A quantidade máxima é 10.000."),
    validityDays: z.coerce
      .number()
      .int("A validade deve ser informada em dias inteiros.")
      .min(1, "A validade mínima é 1 dia.")
      .max(365, "A validade máxima é 365 dias."),
    productionLeadTime: z.coerce
      .number()
      .int("O prazo deve ser informado em dias inteiros.")
      .min(1, "O prazo mínimo é 1 dia.")
      .max(365, "O prazo máximo é 365 dias."),
    productionLeadTimeUnit: z.enum(["business-days", "calendar-days"]),
    paymentMethods: z
      .array(
        z.enum(["pix", "cash", "credit-card", "debit-card", "bank-transfer"]),
      )
      .min(1, "Selecione pelo menos uma forma de pagamento."),
    pixKey: z.string().trim().max(150),
    upfrontPercentage: z.coerce
      .number()
      .min(0, "A entrada mínima é 0%.")
      .max(100, "A entrada máxima é 100%."),
    includeCareInstructions: z.boolean(),
    notes: z.string().trim().max(600),
  })
  .superRefine((quotation, context) => {
    if (quotation.paymentMethods.includes("pix") && !quotation.pixKey) {
      context.addIssue({
        code: "custom",
        path: ["pixKey"],
        message: "Informe a chave Pix.",
      });
    }
  });

export type QuotationFormValues = z.input<typeof quotationFormSchema>;
export type ParsedQuotationFormValues = z.output<typeof quotationFormSchema>;
