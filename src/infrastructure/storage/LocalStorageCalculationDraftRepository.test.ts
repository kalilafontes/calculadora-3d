import { describe, expect, it, vi } from "vitest";
import type { CalculationDraft } from "./CalculationDraftRepository";
import {
  CALCULATION_DRAFT_STORAGE_KEY,
  LocalStorageCalculationDraftRepository,
} from "./LocalStorageCalculationDraftRepository";

const draft: CalculationDraft = {
  schemaVersion: 1,
  savedAt: "2026-07-24T12:00:00Z",
  input: {
    weightGrams: 100,
    piecesPerPrint: 1,
    filamentPricePerKg: 100,
    printTimeHours: 2,
    printerPowerWatts: 200,
    stateCode: "BA",
    energyPricePerKwh: 1,
    energyPriceOrigin: "manual",
    packagingCost: 5,
    laborMode: "direct",
    directLaborCost: 10,
    otherCosts: 0,
    lossPercentage: 10,
    marginPercentage: 20,
  },
};

describe("LocalStorageCalculationDraftRepository", () => {
  it("salva, carrega e limpa somente a chave da aplicação", async () => {
    const repository = new LocalStorageCalculationDraftRepository(localStorage);

    await repository.save(draft);
    await expect(repository.load()).resolves.toEqual(draft);

    await repository.clear();
    expect(localStorage.getItem(CALCULATION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("ignora ausência, JSON corrompido e versão desconhecida", async () => {
    const repository = new LocalStorageCalculationDraftRepository(localStorage);
    await expect(repository.load()).resolves.toBeNull();

    localStorage.setItem(CALCULATION_DRAFT_STORAGE_KEY, "{");
    await expect(repository.load()).resolves.toBeNull();

    localStorage.setItem(
      CALCULATION_DRAFT_STORAGE_KEY,
      JSON.stringify({ ...draft, schemaVersion: 2 }),
    );
    await expect(repository.load()).resolves.toBeNull();
  });

  it("não propaga falhas do mecanismo de armazenamento", async () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("indisponível");
      }),
      setItem: vi.fn(() => {
        throw new Error("indisponível");
      }),
      removeItem: vi.fn(() => {
        throw new Error("indisponível");
      }),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } satisfies Storage;
    const repository = new LocalStorageCalculationDraftRepository(storage);

    await expect(repository.load()).resolves.toBeNull();
    await expect(repository.save(draft)).resolves.toBeUndefined();
    await expect(repository.clear()).resolves.toBeUndefined();
  });

  it("não grava draft inválido", async () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } satisfies Storage;
    const repository = new LocalStorageCalculationDraftRepository(storage);

    await repository.save({
      ...draft,
      savedAt: "data inválida",
    });

    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
