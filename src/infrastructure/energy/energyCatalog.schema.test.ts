import { describe, expect, it } from "vitest";
import { energyCatalogSchema } from "./energyCatalog.schema";
import { createEnergyCatalogFixture } from "./energyCatalog.test-fixture";

describe("energyCatalogSchema", () => {
  it("aceita catálogo B1 convencional com 27 UFs", () => {
    expect(
      energyCatalogSchema.parse(createEnergyCatalogFixture()).states,
    ).toHaveLength(27);
  });

  it("rejeita UF ausente", () => {
    const catalog = createEnergyCatalogFixture();
    catalog.states.pop();
    expect(energyCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejeita relação, estimativa ou par duplicado inválido", () => {
    const invalidRelation = createEnergyCatalogFixture();
    invalidRelation.states[0]!.distributorIds.push("inexistente");

    const invalidEstimate = createEnergyCatalogFixture();
    invalidEstimate.distributorTariffEstimates[0]!.stateCode = "SP";

    const duplicate = createEnergyCatalogFixture();
    duplicate.distributorTariffEstimates.push({
      ...duplicate.distributorTariffEstimates[0]!,
    });

    expect(energyCatalogSchema.safeParse(invalidRelation).success).toBe(false);
    expect(energyCatalogSchema.safeParse(invalidEstimate).success).toBe(false);
    expect(energyCatalogSchema.safeParse(duplicate).success).toBe(false);
  });

  it("rejeita preço não positivo e perfil diferente", () => {
    const catalog = createEnergyCatalogFixture();
    catalog.states[0]!.averagePricePerKwh = 0;
    Object.assign(catalog.tariffProfile, { consumerClass: "B3" });

    expect(energyCatalogSchema.safeParse(catalog).success).toBe(false);
  });
});
