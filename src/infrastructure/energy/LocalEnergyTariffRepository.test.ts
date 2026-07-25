import { describe, expect, it } from "vitest";
import { createEnergyCatalogFixture } from "./energyCatalog.test-fixture";
import { LocalEnergyTariffRepository } from "./LocalEnergyTariffRepository";

describe("LocalEnergyTariffRepository", () => {
  it("retorna catálogo e média estadual", async () => {
    const repository = new LocalEnergyTariffRepository(
      createEnergyCatalogFixture(),
    );

    await expect(repository.getCatalog()).resolves.toMatchObject({
      schemaVersion: 1,
    });
    await expect(repository.getStateEstimate("BA")).resolves.toMatchObject({
      pricePerKwh: 1,
      origin: "state",
      stateCode: "BA",
    });
  });

  it("retorna estimativa específica por par UF/distribuidora", async () => {
    const repository = new LocalEnergyTariffRepository(
      createEnergyCatalogFixture(),
    );

    await expect(
      repository.getDistributorEstimate("BA", "fixture-ba"),
    ).resolves.toMatchObject({
      pricePerKwh: 1.1,
      origin: "distributor",
      stateCode: "BA",
      distributorId: "fixture-ba",
    });
  });

  it("retorna null quando a estimativa não existe", async () => {
    const repository = new LocalEnergyTariffRepository(
      createEnergyCatalogFixture(),
    );

    await expect(
      repository.getDistributorEstimate("SP", "fixture-ba"),
    ).resolves.toBeNull();
  });

  it("rejeita catálogo inválido na construção", () => {
    expect(() => new LocalEnergyTariffRepository({})).toThrow();
  });
});
