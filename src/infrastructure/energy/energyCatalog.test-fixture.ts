import {
  BRAZIL_STATE_CODES,
  type BrazilStateCode,
} from "../../domain/calculation/calculation.types";
import type { EnergyTariffCatalog } from "./EnergyTariffRepository";

const stateNames: Record<BrazilStateCode, string> = Object.fromEntries(
  BRAZIL_STATE_CODES.map((stateCode) => [stateCode, stateCode]),
) as Record<BrazilStateCode, string>;

export function createEnergyCatalogFixture(): EnergyTariffCatalog {
  return {
    schemaVersion: 1,
    source: {
      name: "ANEEL",
      url: "https://dadosabertos.aneel.gov.br/",
      retrievedAt: "2026-07-24T12:00:00Z",
    },
    referencePeriod: {
      start: "2025-07",
      end: "2026-06",
      method: "rolling-12-month-weighted-average",
    },
    tariffProfile: {
      consumerClass: "B1_RESIDENTIAL",
      tariffModality: "CONVENTIONAL",
    },
    states: BRAZIL_STATE_CODES.map((stateCode) => ({
      stateCode,
      stateName: stateNames[stateCode],
      averagePricePerKwh: 1,
      distributorIds: stateCode === "BA" ? ["fixture-ba"] : [],
    })),
    distributors: [
      {
        id: "fixture-ba",
        name: "Distribuidora de teste",
        agentCode: "FIXTURE",
        stateCodes: ["BA"],
      },
    ],
    distributorTariffEstimates: [
      {
        stateCode: "BA",
        distributorId: "fixture-ba",
        averagePricePerKwh: 1.1,
        includedComponents: ["TUSD", "TE"],
      },
    ],
  };
}
