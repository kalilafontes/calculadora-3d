import { describe, expect, it } from "vitest";
import { findPrinterProfile, printerCatalog } from "./printerCatalog";

describe("printerCatalog", () => {
  it("mantém fonte oficial em todos os modelos", () => {
    expect(printerCatalog).toHaveLength(2);
    for (const printer of printerCatalog) {
      expect(printer.source.type).toBe("manufacturer");
      expect(printer.source.url).toMatch(/^https:\/\//);
    }
  });

  it("resolve as potências máximas oficiais por modelo e tensão", () => {
    expect(findPrinterProfile("bambu-lab-a1", 127)?.profile.maxPowerWatts).toBe(
      350,
    );
    expect(findPrinterProfile("bambu-lab-a1", 220)?.profile.maxPowerWatts).toBe(
      1300,
    );
    expect(
      findPrinterProfile("bambu-lab-a1-mini", 127)?.profile.maxPowerWatts,
    ).toBe(150);
    expect(
      findPrinterProfile("bambu-lab-a1-mini", 220)?.profile.maxPowerWatts,
    ).toBe(150);
    expect(findPrinterProfile("inexistente", 127)).toBeNull();
  });
});
