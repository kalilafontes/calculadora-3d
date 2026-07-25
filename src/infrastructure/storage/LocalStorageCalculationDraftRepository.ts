import type {
  CalculationDraft,
  CalculationDraftRepository,
} from "./CalculationDraftRepository";
import { calculationDraftSchema } from "./calculationDraft.schema";

export const CALCULATION_DRAFT_STORAGE_KEY = "calculadora3d:draft:v1";

export class LocalStorageCalculationDraftRepository implements CalculationDraftRepository {
  readonly #storage: Storage;

  constructor(storage: Storage = window.localStorage) {
    this.#storage = storage;
  }

  async load(): Promise<CalculationDraft | null> {
    try {
      const serialized = this.#storage.getItem(CALCULATION_DRAFT_STORAGE_KEY);
      if (!serialized) {
        return null;
      }

      const parsedJson: unknown = JSON.parse(serialized);
      const parsedDraft = calculationDraftSchema.safeParse(parsedJson);
      return parsedDraft.success ? parsedDraft.data : null;
    } catch {
      return null;
    }
  }

  async save(draft: CalculationDraft): Promise<void> {
    try {
      const validDraft = calculationDraftSchema.parse(draft);
      this.#storage.setItem(
        CALCULATION_DRAFT_STORAGE_KEY,
        JSON.stringify(validDraft),
      );
    } catch {
      // Persistência é uma conveniência e nunca bloqueia o cálculo.
    }
  }

  async clear(): Promise<void> {
    try {
      this.#storage.removeItem(CALCULATION_DRAFT_STORAGE_KEY);
    } catch {
      // O formulário permanece utilizável mesmo sem acesso ao armazenamento.
    }
  }
}
