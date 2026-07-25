import type { CalculationInput } from "../../domain/calculation/calculation.types";

export interface CalculationDraft {
  schemaVersion: 1;
  savedAt: string;
  input: CalculationInput;
}

export interface CalculationDraftRepository {
  load(): Promise<CalculationDraft | null>;
  save(draft: CalculationDraft): Promise<void>;
  clear(): Promise<void>;
}
