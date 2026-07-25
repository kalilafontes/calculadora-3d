import type {
  CalculationInput,
  CalculationResult,
} from "../../domain/calculation/calculation.types";

export interface SavedCalculation {
  id: string;
  schemaVersion: 1;
  title: string;
  input: CalculationInput;
  result: CalculationResult;
  createdAt: string;
  updatedAt: string;
}

export interface SavedCalculationRepository {
  listRecent(limit?: number): Promise<SavedCalculation[]>;
  save(calculation: SavedCalculation): Promise<void>;
  delete(id: string): Promise<void>;
}
