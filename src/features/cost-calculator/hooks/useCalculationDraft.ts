import { useCallback, useEffect, useRef, useState } from "react";
import type { CalculationInput } from "../../../domain/calculation/calculation.types";
import type { CalculationDraftRepository } from "../../../infrastructure/storage/CalculationDraftRepository";

const SAVE_DELAY_MS = 300;

interface UseCalculationDraftOptions {
  input: CalculationInput | null;
  repository: CalculationDraftRepository;
  restore: (input: CalculationInput) => void;
  reset: () => void;
}

export function useCalculationDraft({
  input,
  repository,
  restore,
  reset,
}: UseCalculationDraftOptions) {
  const [isReady, setIsReady] = useState(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    let active = true;

    void repository.load().then((draft) => {
      if (!active) return;
      if (draft) restore(draft.input);
      setIsReady(true);
    });

    return () => {
      active = false;
    };
  }, [repository, restore]);

  useEffect(() => {
    if (!isReady || !input) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      void repository.save({
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        input,
      });
    }, SAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [input, isReady, repository]);

  const clear = useCallback(() => {
    skipNextSave.current = true;
    void repository.clear();
    reset();
  }, [repository, reset]);

  return { clear, isReady };
}
