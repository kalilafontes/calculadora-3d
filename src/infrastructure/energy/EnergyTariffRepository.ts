import type { BrazilStateCode } from "../../domain/calculation/calculation.types";

export interface EnergySource {
  name: "ANEEL";
  url: string;
  retrievedAt: string;
}

export interface EnergyReferencePeriod {
  start: string;
  end: string;
  method: "rolling-12-month-weighted-average";
}

export interface TariffProfile {
  consumerClass: "B1_RESIDENTIAL";
  tariffModality: "CONVENTIONAL";
}

export interface StateTariff {
  stateCode: BrazilStateCode;
  stateName: string;
  averagePricePerKwh: number;
  distributorIds: string[];
}

export interface Distributor {
  id: string;
  name: string;
  agentCode: string;
  stateCodes: BrazilStateCode[];
}

export interface DistributorTariffEstimate {
  stateCode: BrazilStateCode;
  distributorId: string;
  averagePricePerKwh: number;
  includedComponents: string[];
}

export interface EnergyTariffCatalog {
  schemaVersion: 1;
  source: EnergySource;
  referencePeriod: EnergyReferencePeriod;
  tariffProfile: TariffProfile;
  states: StateTariff[];
  distributors: Distributor[];
  distributorTariffEstimates: DistributorTariffEstimate[];
}

export interface EnergyEstimate {
  pricePerKwh: number;
  origin: "state" | "distributor";
  stateCode: BrazilStateCode;
  distributorId?: string;
  source: EnergySource;
  referencePeriod: EnergyReferencePeriod;
  tariffProfile: TariffProfile;
}

export interface EnergyTariffRepository {
  getCatalog(): Promise<EnergyTariffCatalog>;
  getStateEstimate(stateCode: BrazilStateCode): Promise<EnergyEstimate | null>;
  getDistributorEstimate(
    stateCode: BrazilStateCode,
    distributorId: string,
  ): Promise<EnergyEstimate | null>;
}
