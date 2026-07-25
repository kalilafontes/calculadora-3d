import { describe, expect, it } from "vitest";
import { calculateCosts } from "./calculateCosts";
import type { CalculationInput } from "./calculation.types";

const baseInput: CalculationInput = {
  weightGrams: 100,
  piecesPerPrint: 1,
  filamentPricePerKg: 100,
  printTimeHours: 2,
  printerPowerWatts: 200,
  stateCode: "BA",
  energyPricePerKwh: 1,
  energyPriceOrigin: "manual",
  packagingCost: 5,
  laborMode: "direct",
  directLaborCost: 10,
  otherCosts: 4.6,
  lossPercentage: 10,
  marginPercentage: 20,
};

describe("calculateCosts", () => {
  it("calcula a composição completa sem arredondar etapas", () => {
    const result = calculateCosts(baseInput);

    expect(result.filamentCost).toBeCloseTo(10);
    expect(result.energyCost).toBeCloseTo(0.4);
    expect(result.lossBaseCost).toBeCloseTo(10.4);
    expect(result.lossCost).toBeCloseTo(1.04);
    expect(result.laborCost).toBeCloseTo(10);
    expect(result.packagingCost).toBeCloseTo(5);
    expect(result.otherCosts).toBeCloseTo(4.6);
    expect(result.totalCost).toBeCloseTo(31.04);
    expect(result.suggestedPrice).toBeCloseTo(38.8);
    expect(result.profit).toBeCloseTo(7.76);
  });

  it("calcula mão de obra por tempo e valor da hora", () => {
    const result = calculateCosts({
      ...baseInput,
      laborMode: "calculated",
      directLaborCost: undefined,
      laborTimeHours: 1.5,
      laborHourlyRate: 20,
    });

    expect(result.laborCost).toBe(30);
  });

  it("deriva custo e preço por peça a partir da impressão completa", () => {
    const result = calculateCosts({ ...baseInput, piecesPerPrint: 8 });

    expect(result.totalCost).toBeCloseTo(31.04);
    expect(result.unitTotalCost).toBeCloseTo(3.88);
    expect(result.unitSuggestedPrice).toBeCloseTo(4.85);
    expect(result.unitProfit).toBeCloseTo(0.97);
  });

  it("aceita zeros e margem zero", () => {
    const result = calculateCosts({
      ...baseInput,
      weightGrams: 0,
      printTimeHours: 0,
      packagingCost: 0,
      directLaborCost: 0,
      otherCosts: 0,
      lossPercentage: 0,
      marginPercentage: 0,
    });

    expect(result.totalCost).toBe(0);
    expect(result.suggestedPrice).toBe(0);
    expect(result.profit).toBe(0);
  });

  it("usa zero como fallback para mão de obra condicional ausente", () => {
    expect(
      calculateCosts({
        ...baseInput,
        laborMode: "calculated",
        laborTimeHours: undefined,
        laborHourlyRate: undefined,
      }).laborCost,
    ).toBe(0);

    expect(
      calculateCosts({
        ...baseInput,
        laborMode: "direct",
        directLaborCost: undefined,
      }).laborCost,
    ).toBe(0);
  });
});
