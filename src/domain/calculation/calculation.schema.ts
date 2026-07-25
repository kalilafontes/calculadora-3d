import { z } from "zod";
import { BRAZIL_STATE_CODES, type CalculationInput } from "./calculation.types";
import { parsePtBrNumber } from "./parsePtBrNumber";

const requiredNumber = (label: string) =>
  z.preprocess(
    parsePtBrNumber,
    z
      .number({ error: `${label} deve ser um número.` })
      .finite(`${label} deve ser um número válido.`)
      .min(0, `${label} não pode ser negativo.`),
  );

const percentage = (label: string, allowOneHundred: boolean) =>
  z.preprocess(
    parsePtBrNumber,
    z
      .number({ error: `${label} deve ser um número.` })
      .finite(`${label} deve ser um número válido.`)
      .min(0, `${label} não pode ser negativo.`)
      .refine(
        (value) => (allowOneHundred ? value <= 100 : value < 100),
        allowOneHundred
          ? `${label} deve ser de no máximo 100%.`
          : `${label} deve ser menor que 100%.`,
      ),
  );

export const calculationSchema = z
  .object({
    weightGrams: requiredNumber("Peso"),
    filamentPricePerKg: requiredNumber("Preço do filamento"),
    printTimeHours: requiredNumber("Tempo de impressão"),
    printerPowerWatts: requiredNumber("Potência"),
    printerModelId: z.string().min(1).optional(),
    printerVoltage: z.union([z.literal(127), z.literal(220)]).optional(),
    printerPowerOrigin: z.enum(["manufacturer-max", "manual"]).optional(),
    stateCode: z.enum(BRAZIL_STATE_CODES),
    distributorId: z.string().min(1).optional(),
    energyPricePerKwh: requiredNumber("Preço da energia"),
    energyPriceOrigin: z.enum(["state", "distributor", "manual"]),
    packagingCost: requiredNumber("Embalagem"),
    laborMode: z.enum(["calculated", "direct"]),
    laborTimeHours: requiredNumber("Tempo de mão de obra").optional(),
    laborHourlyRate: requiredNumber("Valor da hora").optional(),
    directLaborCost: requiredNumber("Mão de obra").optional(),
    otherCosts: requiredNumber("Outros custos"),
    lossPercentage: percentage("Perdas", true),
    marginPercentage: percentage("Margem", false),
  })
  .superRefine((input, context) => {
    if (input.laborMode === "calculated") {
      if (input.laborTimeHours === undefined) {
        context.addIssue({
          code: "custom",
          path: ["laborTimeHours"],
          message: "Informe o tempo de mão de obra.",
        });
      }
      if (input.laborHourlyRate === undefined) {
        context.addIssue({
          code: "custom",
          path: ["laborHourlyRate"],
          message: "Informe o valor da hora.",
        });
      }
    }

    if (input.laborMode === "direct" && input.directLaborCost === undefined) {
      context.addIssue({
        code: "custom",
        path: ["directLaborCost"],
        message: "Informe o custo de mão de obra por peça.",
      });
    }
  }) satisfies z.ZodType<CalculationInput>;
