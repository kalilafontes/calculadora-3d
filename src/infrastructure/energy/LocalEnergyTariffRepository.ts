import type { BrazilStateCode } from "../../domain/calculation/calculation.types";
import { energyCatalogSchema } from "./energyCatalog.schema";
import type {
  EnergyEstimate,
  EnergyTariffCatalog,
  EnergyTariffRepository,
} from "./EnergyTariffRepository";

export class LocalEnergyTariffRepository implements EnergyTariffRepository {
  readonly #catalog: EnergyTariffCatalog;

  constructor(catalog: unknown) {
    this.#catalog = energyCatalogSchema.parse(catalog);
  }

  async getCatalog(): Promise<EnergyTariffCatalog> {
    return this.#catalog;
  }

  async getStateEstimate(
    stateCode: BrazilStateCode,
  ): Promise<EnergyEstimate | null> {
    const state = this.#catalog.states.find(
      (item) => item.stateCode === stateCode,
    );
    return state
      ? this.#toEstimate(state.averagePricePerKwh, "state", stateCode)
      : null;
  }

  async getDistributorEstimate(
    stateCode: BrazilStateCode,
    distributorId: string,
  ): Promise<EnergyEstimate | null> {
    const estimate = this.#catalog.distributorTariffEstimates.find(
      (item) =>
        item.stateCode === stateCode && item.distributorId === distributorId,
    );
    return estimate
      ? this.#toEstimate(
          estimate.averagePricePerKwh,
          "distributor",
          stateCode,
          distributorId,
        )
      : null;
  }

  #toEstimate(
    pricePerKwh: number,
    origin: EnergyEstimate["origin"],
    stateCode: BrazilStateCode,
    distributorId?: string,
  ): EnergyEstimate {
    return {
      pricePerKwh,
      origin,
      stateCode,
      distributorId,
      source: this.#catalog.source,
      referencePeriod: this.#catalog.referencePeriod,
      tariffProfile: this.#catalog.tariffProfile,
    };
  }
}
