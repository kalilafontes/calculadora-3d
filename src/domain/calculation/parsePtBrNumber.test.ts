import { describe, expect, it } from "vitest";
import { parsePtBrNumber } from "./parsePtBrNumber";

describe("parsePtBrNumber", () => {
  it("preserva valores que não são string", () => {
    expect(parsePtBrNumber(12)).toBe(12);
  });

  it("normaliza vírgula, espaços e bordas", () => {
    expect(parsePtBrNumber(" 1 234,5 ")).toBe(1234.5);
  });

  it("converte texto vazio em undefined", () => {
    expect(parsePtBrNumber("   ")).toBeUndefined();
  });

  it("preserva texto não numérico para o schema explicar o erro", () => {
    expect(parsePtBrNumber("abc")).toBe("abc");
  });
});
