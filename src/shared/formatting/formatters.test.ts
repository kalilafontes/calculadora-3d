import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatEnergyPrice,
  formatHours,
  formatPercentage,
} from "./formatters";

describe("formatters", () => {
  it("formata moeda em BRL", () => {
    expect(formatCurrency(12.5)).toContain("12,50");
  });

  it("formata percentual, horas e energia", () => {
    expect(formatPercentage(12.5)).toBe("12,5%");
    expect(formatHours(2.25)).toBe("2,25 h");
    expect(formatEnergyPrice(1.1)).toContain("1,10");
    expect(formatEnergyPrice(1.1)).toContain("/kWh");
  });
});
