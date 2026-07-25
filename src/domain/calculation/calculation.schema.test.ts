import { describe, expect, it } from "vitest";
import { calculationSchema } from "./calculation.schema";

const validInput = {
  weightGrams: "100,5",
  filamentPricePerKg: 100,
  printTimeHours: 2,
  printerPowerWatts: 200,
  stateCode: "BA",
  energyPricePerKwh: "1,05",
  energyPriceOrigin: "manual",
  packagingCost: 5,
  laborMode: "calculated",
  laborTimeHours: 1,
  laborHourlyRate: 20,
  otherCosts: 0,
  lossPercentage: 10,
  marginPercentage: 20,
};

describe("calculationSchema", () => {
  it("normaliza decimais pt-BR e valida entrada calculada", () => {
    const result = calculationSchema.parse(validInput);

    expect(result.weightGrams).toBe(100.5);
    expect(result.energyPricePerKwh).toBe(1.05);
    expect(result.piecesPerPrint).toBe(1);
  });

  it("aceita mão de obra direta", () => {
    const result = calculationSchema.parse({
      ...validInput,
      laborMode: "direct",
      laborTimeHours: undefined,
      laborHourlyRate: undefined,
      directLaborCost: 15,
    });

    expect(result.directLaborCost).toBe(15);
  });

  it("rejeita campos condicionais ausentes", () => {
    const calculated = calculationSchema.safeParse({
      ...validInput,
      laborTimeHours: undefined,
      laborHourlyRate: undefined,
    });
    const direct = calculationSchema.safeParse({
      ...validInput,
      laborMode: "direct",
      directLaborCost: undefined,
    });

    expect(calculated.success).toBe(false);
    expect(direct.success).toBe(false);
  });

  it.each([
    ["weightGrams", -1],
    ["lossPercentage", 101],
    ["marginPercentage", 100],
    ["energyPricePerKwh", "não é número"],
    ["packagingCost", ""],
    ["otherCosts", Number.POSITIVE_INFINITY],
    ["piecesPerPrint", 0],
    ["piecesPerPrint", 1.5],
  ])("rejeita %s inválido", (field, value) => {
    const result = calculationSchema.safeParse({
      ...validInput,
      [field]: value,
    });

    expect(result.success).toBe(false);
  });
});
