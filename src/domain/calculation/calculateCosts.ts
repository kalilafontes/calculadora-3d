import type { CalculationInput, CalculationResult } from "./calculation.types";

export function calculateCosts(input: CalculationInput): CalculationResult {
  const filamentCost = (input.weightGrams / 1000) * input.filamentPricePerKg;
  const energyCost =
    (input.printerPowerWatts / 1000) *
    input.printTimeHours *
    input.energyPricePerKwh;
  const lossBaseCost = filamentCost + energyCost;
  const lossCost = lossBaseCost * (input.lossPercentage / 100);
  const laborCost =
    input.laborMode === "calculated"
      ? (input.laborTimeHours ?? 0) * (input.laborHourlyRate ?? 0)
      : (input.directLaborCost ?? 0);
  const totalCost =
    filamentCost +
    energyCost +
    lossCost +
    input.packagingCost +
    laborCost +
    input.otherCosts;
  const suggestedPrice = totalCost / (1 - input.marginPercentage / 100);

  return {
    filamentCost,
    energyCost,
    lossBaseCost,
    lossCost,
    laborCost,
    packagingCost: input.packagingCost,
    otherCosts: input.otherCosts,
    totalCost,
    suggestedPrice,
    profit: suggestedPrice - totalCost,
  };
}
