# Modelo de dados

## CalculationInput

Entradas normalizadas usadas pelo domínio.

| Campo                | Tipo              | Regra                              |
| -------------------- | ----------------- | ---------------------------------- |
| `weightGrams`        | number            | ≥ 0                                |
| `filamentPricePerKg` | number            | ≥ 0                                |
| `printTimeHours`     | number            | ≥ 0                                |
| `printerPowerWatts`  | number            | ≥ 0                                |
| `printerModelId`     | string opcional   | modelo do catálogo local           |
| `printerVoltage`     | number opcional   | `127` ou `220`                     |
| `printerPowerOrigin` | enum opcional     | `manufacturer-max` ou `manual`     |
| `stateCode`          | `BrazilStateCode` | uma das 27 UFs                     |
| `distributorId`      | string opcional   | deve pertencer à UF                |
| `energyPricePerKwh`  | number            | ≥ 0                                |
| `energyPriceOrigin`  | enum              | `state`, `distributor` ou `manual` |
| `packagingCost`      | number            | ≥ 0                                |
| `laborMode`          | enum              | `calculated` ou `direct`           |
| `laborTimeHours`     | number opcional   | ≥ 0 quando calculado               |
| `laborHourlyRate`    | number opcional   | ≥ 0 quando calculado               |
| `directLaborCost`    | number opcional   | ≥ 0 quando direto                  |
| `otherCosts`         | number            | ≥ 0                                |
| `lossPercentage`     | number            | 0 a 100                            |
| `marginPercentage`   | number            | 0 inclusive a 100 exclusive        |

## CalculationResult

Resultado imutável derivado de `CalculationInput`.

| Campo            | Derivação                         |
| ---------------- | --------------------------------- |
| `filamentCost`   | peso/1000 × preço/kg              |
| `energyCost`     | potência/1000 × horas × preço/kWh |
| `lossBaseCost`   | filamento + energia               |
| `lossCost`       | base × percentual de perdas       |
| `laborCost`      | conforme modo de mão de obra      |
| `packagingCost`  | cópia normalizada da entrada      |
| `otherCosts`     | cópia normalizada da entrada      |
| `totalCost`      | soma dos componentes              |
| `suggestedPrice` | total / (1 - margem)              |
| `profit`         | preço sugerido - total            |

## EnergyTariffCatalog

```ts
interface EnergyTariffCatalog {
  schemaVersion: 1;
  source: {
    name: "ANEEL";
    url: string;
    retrievedAt: string;
  };
  referencePeriod: {
    start: string; // YYYY-MM
    end: string; // YYYY-MM
    method: "rolling-12-month-weighted-average";
  };
  tariffProfile: {
    consumerClass: "B1_RESIDENTIAL";
    tariffModality: "CONVENTIONAL";
  };
  states: StateTariff[];
  distributors: Distributor[];
  distributorTariffEstimates: DistributorTariffEstimate[];
}
```

### StateTariff

| Campo                | Tipo     | Descrição           |
| -------------------- | -------- | ------------------- |
| `stateCode`          | UF       | identificador       |
| `stateName`          | string   | nome para interface |
| `averagePricePerKwh` | number   | média ponderada     |
| `distributorIds`     | string[] | opções válidas      |

### Distributor

| Campo        | Tipo   | Descrição                     |
| ------------ | ------ | ----------------------------- |
| `id`         | string | identificador estável interno |
| `name`       | string | nome exibido                  |
| `agentCode`  | string | sigla/código da ANEEL         |
| `stateCodes` | UF[]   | áreas atendidas               |

### DistributorTariffEstimate

Uma entrada representa sempre um único par UF/distribuidora.

| Campo                | Tipo     | Descrição                 |
| -------------------- | -------- | ------------------------- |
| `stateCode`          | UF       | UF da estimativa          |
| `distributorId`      | string   | referência cadastral      |
| `averagePricePerKwh` | number   | média móvel               |
| `includedComponents` | string[] | ex.: tributos e bandeiras |

### Invariantes do catálogo

- existem exatamente 27 UFs únicas;
- todo preço é finito e não negativo;
- todo `distributorId` referenciado existe;
- toda relação UF/distribuidora é recíproca;
- existe no máximo uma estimativa para cada par `{ stateCode, distributorId }`;
- toda estimativa referencia uma UF contida em `Distributor.stateCodes`;
- período e fonte são obrigatórios;
- perfil tarifário é B1 residencial convencional;
- uma distribuidora pode atender mais de uma UF, mas cada UF possui sua própria
  estimativa.

## CalculationDraft

```ts
interface CalculationDraft {
  schemaVersion: 1;
  savedAt: string;
  input: CalculationInput;
}
```

O draft só é aceito após validação integral. `CalculationResult` não é salvo.

## SavedCalculation

```ts
interface SavedCalculation {
  id: string;
  schemaVersion: 1;
  title: string;
  input: CalculationInput;
  result: CalculationResult;
  createdAt: string;
  updatedAt: string;
}
```

| Campo           | Regra                                                  |
| --------------- | ------------------------------------------------------ |
| `id`            | UUID gerado no navegador                               |
| `schemaVersion` | versão `1` do registro                                 |
| `title`         | texto não vazio após remoção de espaços, até 80 chars  |
| `input`         | entradas normalizadas restauráveis                     |
| `result`        | fotografia do resultado no momento do salvamento       |
| `createdAt`     | data ISO 8601 da criação                               |
| `updatedAt`     | data ISO 8601 usada para ordenar os registros recentes |

## Interfaces de fronteira

```ts
interface EnergyTariffRepository {
  getCatalog(): Promise<EnergyTariffCatalog>;
  getStateEstimate(stateCode: BrazilStateCode): Promise<EnergyEstimate | null>;
  getDistributorEstimate(
    stateCode: BrazilStateCode,
    distributorId: string,
  ): Promise<EnergyEstimate | null>;
}

interface CalculationDraftRepository {
  load(): Promise<CalculationDraft | null>;
  save(draft: CalculationDraft): Promise<void>;
  clear(): Promise<void>;
}

interface SavedCalculationRepository {
  listRecent(limit?: number): Promise<SavedCalculation[]>;
  save(calculation: SavedCalculation): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### EnergyEstimate

```ts
interface EnergyEstimate {
  pricePerKwh: number;
  origin: "state" | "distributor";
  stateCode: BrazilStateCode;
  distributorId?: string;
  source: {
    name: "ANEEL";
    url: string;
    retrievedAt: string;
  };
  referencePeriod: {
    start: string;
    end: string;
    method: "rolling-12-month-weighted-average";
  };
  tariffProfile: {
    consumerClass: "B1_RESIDENTIAL";
    tariffModality: "CONVENTIONAL";
  };
}
```

Enums e propriedades do código usam inglês. A interface traduz `state` para
“média estadual”, `distributor` para “distribuidora” e `manual` para “informado
manualmente”.

## Transições relevantes

```text
UF alterada
  → distribuidora removida
  → estimativa estadual aplicada
  → origem = state

Distribuidora selecionada
  → estimativa da distribuidora aplicada
  → origem = distributor

Preço do kWh editado
  → origem = manual

Limpar
  → draft removido
  → formulário volta aos valores iniciais seguros

Salvar cálculo nomeado
  → UUID e datas gerados
  → entradas e resultado persistidos no IndexedDB
  → lista de recentes recarregada

Abrir cálculo recente
  → entradas restauradas no formulário
  → resultados recalculados
  → página retorna suavemente ao topo
```
