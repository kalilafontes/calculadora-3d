import { describe, expect, it } from "vitest";
import { formatDistributorName } from "./formatDistributorName";

describe("formatDistributorName", () => {
  it("abrevia nomes longos com reticências", () => {
    expect(
      formatDistributorName(
        "COMPANHIA MUITO LONGA DE DISTRIBUIÇÃO DE ENERGIA ELÉTRICA",
      ),
    ).toBe("COMPANHIA MUITO LONGA DE DISTRIBUIÇ...");
  });

  it("preserva nomes curtos", () => {
    expect(formatDistributorName("COELBA")).toBe("COELBA");
  });
});
