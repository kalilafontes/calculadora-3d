export function parsePtBrNumber(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");

  if (normalized === "") {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? value : parsed;
}
