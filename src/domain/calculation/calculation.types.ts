export const BRAZIL_STATE_CODES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type BrazilStateCode = (typeof BRAZIL_STATE_CODES)[number];
export type EnergyPriceOrigin = "state" | "distributor" | "manual";
export type LaborMode = "calculated" | "direct";

export interface CalculationInput {
  weightGrams: number;
  piecesPerPrint: number;
  filamentPricePerKg: number;
  printTimeHours: number;
  printerPowerWatts: number;
  printerModelId?: string;
  printerVoltage?: 127 | 220;
  printerPowerOrigin?: "manufacturer-max" | "manual";
  stateCode: BrazilStateCode;
  distributorId?: string;
  energyPricePerKwh: number;
  energyPriceOrigin: EnergyPriceOrigin;
  packagingCost: number;
  laborMode: LaborMode;
  laborTimeHours?: number;
  laborHourlyRate?: number;
  directLaborCost?: number;
  otherCosts: number;
  lossPercentage: number;
  marginPercentage: number;
}

export interface CalculationResult {
  filamentCost: number;
  energyCost: number;
  lossBaseCost: number;
  lossCost: number;
  laborCost: number;
  packagingCost: number;
  otherCosts: number;
  totalCost: number;
  suggestedPrice: number;
  profit: number;
  piecesPerPrint: number;
  unitTotalCost: number;
  unitSuggestedPrice: number;
  unitProfit: number;
}
