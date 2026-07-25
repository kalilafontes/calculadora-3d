import { createReadStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "../..");
const manifestPath = resolve(scriptDirectory, "raw/manifest.json");
const outputPath = resolve(
  projectRoot,
  "src/infrastructure/energy/energy-tariffs.json",
);

const stateNames = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.split("=");
    return [key, value.join("=")];
  }),
);

function parseCsvLine(line) {
  const fields = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ";" && !quoted) {
      fields.push(value);
      value = "";
    } else {
      value += character;
    }
  }
  fields.push(value.replace(/\r$/, ""));
  return fields;
}

function normalizeCnpj(value) {
  return value.replace(/\D/g, "").padStart(14, "0");
}

function parseDecimal(value) {
  const trimmed = value.trim();
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new Error(`Valor inválido: ${value}`);
  return parsed;
}

async function forEachCsvRow(path, encoding, callback) {
  const input = createReadStream(path, { encoding });
  const lines = createInterface({ input, crlfDelay: Infinity });
  let headers;
  for await (const line of lines) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }
    const fields = parseCsvLine(line);
    const row = Object.fromEntries(
      headers.map((header, index) => [header, fields[index] ?? ""]),
    );
    callback(row);
  }
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const marketPath = resolve(
  args.get("--market") ??
    resolve(scriptDirectory, "raw", manifest.sources.market.fileName),
);
const stateMapPath = resolve(
  args.get("--states") ??
    resolve(
      scriptDirectory,
      "raw",
      manifest.sources.distributorStates.fileName,
    ),
);

const statesByCnpj = new Map();
await forEachCsvRow(
  stateMapPath,
  manifest.sources.distributorStates.encoding,
  (row) => {
    const stateCode = row.SigUF?.trim();
    if (!(stateCode in stateNames)) return;
    const cnpj = normalizeCnpj(row.NumCPFCNPJ);
    const states = statesByCnpj.get(cnpj) ?? new Set();
    states.add(stateCode);
    statesByCnpj.set(cnpj, states);
  },
);

const details = new Set([
  "Energia TE (kWh)",
  "Receita Energia (R$)",
  "Receita Bandeiras (R$)",
  "ICMS (R$)",
  "PIS/PASEP (R$)",
  "COFINS (R$)",
]);
const aggregates = new Map();
const months = new Set();

await forEachCsvRow(marketPath, manifest.sources.market.encoding, (row) => {
  if (
    row.DscModalidadeTarifaria !== "Convencional" ||
    row.DscSubGrupoTarifario !== "B1" ||
    row.DscClasseConsumoMercado !== "Residencial" ||
    row.DscSubClasseConsumidor !== "Residencial" ||
    row.DscOpcaoEnergia !== "CATIVO" ||
    !["Regular", "Sistema Isolado - Regular"].includes(row.NomTipoMercado) ||
    !details.has(row.DscDetalheMercado)
  ) {
    return;
  }

  const month = row.DatCompetencia.slice(0, 7);
  months.add(month);
  const cnpj = normalizeCnpj(row.NumCNPJAgenteDistribuidora);
  const key = `${cnpj}:${month}`;
  const aggregate = aggregates.get(key) ?? {
    cnpj,
    agentCode: row.SigAgenteDistribuidora.trim(),
    name: row.NomAgenteDistribuidora.trim(),
    month,
    consumptionKwh: 0,
    revenueBrl: 0,
  };
  const value = parseDecimal(row.VlrMercado);
  if (row.DscDetalheMercado === "Energia TE (kWh)") {
    aggregate.consumptionKwh += value;
  } else {
    aggregate.revenueBrl += value;
  }
  aggregates.set(key, aggregate);
});

const selectedMonths = [...months].sort().slice(-12);
if (selectedMonths.length !== 12) {
  throw new Error(
    `Esperados 12 meses completos; encontrados ${selectedMonths.length}.`,
  );
}
const selectedMonthSet = new Set(selectedMonths);
const distributorsByCnpj = new Map();

for (const aggregate of aggregates.values()) {
  if (!selectedMonthSet.has(aggregate.month)) continue;
  const distributor = distributorsByCnpj.get(aggregate.cnpj) ?? {
    cnpj: aggregate.cnpj,
    agentCode: aggregate.agentCode,
    name: aggregate.name,
    consumptionKwh: 0,
    revenueBrl: 0,
  };
  distributor.consumptionKwh += aggregate.consumptionKwh;
  distributor.revenueBrl += aggregate.revenueBrl;
  distributorsByCnpj.set(aggregate.cnpj, distributor);
}

const distributors = [];
const distributorTariffEstimates = [];
for (const distributor of [...distributorsByCnpj.values()].sort((a, b) =>
  a.cnpj.localeCompare(b.cnpj),
)) {
  const stateCodes = [...(statesByCnpj.get(distributor.cnpj) ?? [])].sort();
  if (stateCodes.length === 0 || distributor.consumptionKwh <= 0) continue;
  const id = `aneel-${distributor.cnpj}`;
  const averagePricePerKwh =
    distributor.revenueBrl / distributor.consumptionKwh;
  if (!Number.isFinite(averagePricePerKwh) || averagePricePerKwh <= 0) continue;
  distributors.push({
    id,
    name: distributor.name,
    agentCode: distributor.agentCode,
    stateCodes,
  });
  for (const stateCode of stateCodes) {
    distributorTariffEstimates.push({
      stateCode,
      distributorId: id,
      averagePricePerKwh,
      includedComponents: [
        "energy",
        "tariff-flags",
        "icms",
        "pis-pasep",
        "cofins",
      ],
      _weightKwh: distributor.consumptionKwh,
    });
  }
}

const states = Object.entries(stateNames).map(([stateCode, stateName]) => {
  const estimates = distributorTariffEstimates.filter(
    (estimate) => estimate.stateCode === stateCode,
  );
  if (estimates.length === 0) {
    throw new Error(`Nenhuma estimativa válida para ${stateCode}.`);
  }
  const totalConsumption = estimates.reduce(
    (total, estimate) => total + estimate._weightKwh,
    0,
  );
  return {
    stateCode,
    stateName,
    averagePricePerKwh: estimates.reduce(
      (average, estimate) =>
        average +
        estimate.averagePricePerKwh * (estimate._weightKwh / totalConsumption),
      0,
    ),
    distributorIds: estimates.map((estimate) => estimate.distributorId).sort(),
  };
});

const catalog = {
  schemaVersion: 1,
  source: {
    name: "ANEEL",
    url: manifest.sources.market.url,
    retrievedAt: manifest.retrievedAt,
  },
  referencePeriod: {
    start: selectedMonths[0],
    end: selectedMonths.at(-1),
    method: "rolling-12-month-weighted-average",
  },
  tariffProfile: {
    consumerClass: "B1_RESIDENTIAL",
    tariffModality: "CONVENTIONAL",
  },
  states,
  distributors,
  distributorTariffEstimates: distributorTariffEstimates.map(
    ({ _weightKwh, ...estimate }) => estimate,
  ),
};

await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(
  `Catálogo gerado: ${states.length} UFs, ${distributors.length} distribuidoras, ${selectedMonths[0]}–${selectedMonths.at(-1)}.`,
);
