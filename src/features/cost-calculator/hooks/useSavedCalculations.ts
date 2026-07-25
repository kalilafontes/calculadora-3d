import { useCallback, useEffect, useState } from "react";
import type {
  CalculationInput,
  CalculationResult,
} from "../../../domain/calculation/calculation.types";
import type {
  SavedCalculation,
  SavedCalculationRepository,
} from "../../../infrastructure/storage/SavedCalculationRepository";

interface UseSavedCalculationsOptions {
  repository: SavedCalculationRepository;
}

export function useSavedCalculations({
  repository,
}: UseSavedCalculationsOptions) {
  const [recent, setRecent] = useState<SavedCalculation[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setRecent(await repository.listRecent(5));
    } catch {
      setStatus("Não foi possível acessar os cálculos deste navegador.");
    }
  }, [repository]);

  useEffect(() => {
    let active = true;

    void repository
      .listRecent(5)
      .then((calculations) => {
        if (active) setRecent(calculations);
      })
      .catch(() => {
        if (active) {
          setStatus("Não foi possível acessar os cálculos deste navegador.");
        }
      });

    return () => {
      active = false;
    };
  }, [repository]);

  const save = useCallback(
    async (
      title: string,
      input: CalculationInput,
      result: CalculationResult,
    ) => {
      const now = new Date().toISOString();
      const calculation: SavedCalculation = {
        id: crypto.randomUUID(),
        schemaVersion: 1,
        title: title.trim(),
        input,
        result,
        createdAt: now,
        updatedAt: now,
      };

      try {
        await repository.save(calculation);
        setStatus("Cálculo salvo neste navegador.");
        await refresh();
        return true;
      } catch {
        setStatus("Não foi possível salvar o cálculo neste navegador.");
        return false;
      }
    },
    [refresh, repository],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await repository.delete(id);
        setStatus("Cálculo excluído.");
        await refresh();
      } catch {
        setStatus("Não foi possível excluir o cálculo.");
      }
    },
    [refresh, repository],
  );

  return { recent, status, save, remove };
}
