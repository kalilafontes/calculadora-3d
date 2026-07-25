import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(
  process.cwd(),
  "src/infrastructure/energy/energy-tariffs.json",
);
const catalog = JSON.parse(await readFile(path, "utf8"));
const prices = [
  ...catalog.states.map((state) => state.averagePricePerKwh),
  ...catalog.distributorTariffEstimates.map(
    (estimate) => estimate.averagePricePerKwh,
  ),
];

if (
  catalog.states.length !== 27 ||
  prices.some((price) => !Number.isFinite(price) || price <= 0 || price >= 3)
) {
  throw new Error(
    "Catálogo inválido: faltam UFs ou há tarifa placeholder/anômala.",
  );
}

console.log(
  `Catálogo válido: ${catalog.states.length} UFs e ${catalog.distributorTariffEstimates.length} estimativas.`,
);
