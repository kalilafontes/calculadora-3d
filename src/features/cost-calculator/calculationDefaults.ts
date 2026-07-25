import type { CalculationInput } from "../../domain/calculation/calculation.types";

export const calculationDefaults: CalculationInput = {
  weightGrams: 0,
  filamentPricePerKg: 0,
  printTimeHours: 0,
  printerPowerWatts: 0,
  stateCode: "BA",
  energyPricePerKwh: 0,
  energyPriceOrigin: "manual",
  packagingCost: 0,
  laborMode: "calculated",
  laborTimeHours: 0,
  laborHourlyRate: 0,
  otherCosts: 0,
  lossPercentage: 0,
  marginPercentage: 20,
};
