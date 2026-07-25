import { useEffect, useMemo, useState } from "react";
import type { BrazilStateCode } from "../../../domain/calculation/calculation.types";
import catalog from "../../../infrastructure/energy/energy-tariffs.json";
import type {
  Distributor,
  EnergyEstimate,
} from "../../../infrastructure/energy/EnergyTariffRepository";
import { LocalEnergyTariffRepository } from "../../../infrastructure/energy/LocalEnergyTariffRepository";

interface UseEnergyEstimateOptions {
  stateCode: BrazilStateCode;
  distributorId: string;
  manualOverride: boolean;
  applyEstimate: (estimate: EnergyEstimate) => void;
  clearDistributor: () => void;
}

export function useEnergyEstimate({
  stateCode,
  distributorId,
  manualOverride,
  applyEstimate,
  clearDistributor,
}: UseEnergyEstimateOptions) {
  const repository = useMemo(
    () => new LocalEnergyTariffRepository(catalog),
    [],
  );
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [estimate, setEstimate] = useState<EnergyEstimate | null>(null);

  useEffect(() => {
    let active = true;
    void repository.getCatalog().then((loadedCatalog) => {
      if (!active) return;
      setDistributors(
        loadedCatalog.distributors.filter((distributor) =>
          distributor.stateCodes.includes(stateCode),
        ),
      );
    });
    return () => {
      active = false;
    };
  }, [repository, stateCode]);

  useEffect(() => {
    if (
      distributorId &&
      !distributors.some((distributor) => distributor.id === distributorId)
    ) {
      clearDistributor();
    }
  }, [clearDistributor, distributorId, distributors]);

  useEffect(() => {
    let active = true;
    const request = distributorId
      ? repository.getDistributorEstimate(stateCode, distributorId)
      : repository.getStateEstimate(stateCode);
    void request.then((nextEstimate) => {
      if (!active) return;
      setEstimate(nextEstimate);
      if (nextEstimate && !manualOverride) applyEstimate(nextEstimate);
    });
    return () => {
      active = false;
    };
  }, [applyEstimate, distributorId, manualOverride, repository, stateCode]);

  return { distributors, estimate };
}
