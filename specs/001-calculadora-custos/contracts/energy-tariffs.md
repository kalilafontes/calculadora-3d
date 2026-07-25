# Contrato do catálogo de tarifas de energia

## Objetivo

Definir o formato estável entre a geração dos dados oficiais e o frontend. Este
é um contrato de arquivo local no MVP, não um endpoint de rede.

## Local esperado

`src/infrastructure/energy/energy-tariffs.json`

## Exemplo mínimo

```json
{
  "schemaVersion": 1,
  "source": {
    "name": "ANEEL",
    "url": "https://dadosabertos.aneel.gov.br/",
    "retrievedAt": "2026-07-24T12:00:00Z"
  },
  "referencePeriod": {
    "start": "2025-07",
    "end": "2026-06",
    "method": "rolling-12-month-weighted-average"
  },
  "tariffProfile": {
    "consumerClass": "B1_RESIDENTIAL",
    "tariffModality": "CONVENTIONAL"
  },
  "states": [
    {
      "stateCode": "BA",
      "stateName": "Bahia",
      "averagePricePerKwh": "<NUMBER_FROM_GENERATOR>",
      "distributorIds": ["neoenergia-coelba"]
    }
  ],
  "distributors": [
    {
      "id": "neoenergia-coelba",
      "name": "Neoenergia Coelba",
      "agentCode": "COELBA",
      "stateCodes": ["BA"]
    }
  ],
  "distributorTariffEstimates": [
    {
      "stateCode": "BA",
      "distributorId": "neoenergia-coelba",
      "averagePricePerKwh": "<NUMBER_FROM_GENERATOR>",
      "includedComponents": ["<DECLARED_COMPONENTS_FROM_SOURCE>"]
    }
  ]
}
```

Este exemplo é JSON válido, mas intencionalmente inválido perante o schema do
catálogo: os marcadores textuais devem ser substituídos exclusivamente pelo
gerador. Assim, ele não pode ser copiado como catálogo publicável.

## Semântica

- Preços usam R$/kWh.
- Toda estimativa do catálogo MVP usa classe B1 residencial e modalidade
  convencional.
- O frontend deve deixar claro que usuários comerciais ou de outra modalidade
  devem substituir a estimativa pelo valor real de sua conta.
- Datas de competência usam `YYYY-MM`; instante de coleta usa ISO 8601 UTC.
- IDs são minúsculos, estáveis e não dependem do nome comercial futuro.
- `distributors` contém somente cadastro; tarifas ficam exclusivamente em
  `distributorTariffEstimates`.
- Cada estimativa de distribuidora pertence a um único par
  `{ stateCode, distributorId }`.
- `includedComponents` declara explicitamente componentes conhecidos:
  `TUSD`, `TE`, `ICMS`, `PIS_COFINS`, `BANDEIRA`.
- CIP/COSIP não deve constar como componente.

## Resolução de estimativa

1. Se houver preço manual válido, o repositório não o substitui.
2. Se houver distribuidora válida para a UF, retorna seu preço.
3. Caso contrário, retorna a média estadual.
4. Sem média estadual válida, retorna `null` e exige entrada manual.

## Validação antes da publicação

- catálogo foi produzido pelo gerador a partir de
  `scripts/energy-data/raw/manifest.json`;
- manifesto registra URL exata, data de coleta, competência e hash de cada
  entrada bruta;
- esquema e invariantes do modelo passam;
- contém 27 UFs;
- nenhum placeholder permanece;
- valores estão na unidade correta (converter R$/MWh dividindo por 1000);
- médias estaduais são ponderadas por consumo;
- pares UF/distribuidora são únicos, recíprocos e referenciam cadastros válidos;
- competência tem 12 meses completos;
- perfil e registros de origem correspondem a B1 residencial convencional;
- fonte e momento de coleta estão preenchidos;
- amostras são comparadas com o relatório oficial correspondente.

## Determinismo da geração

- as entradas são processadas em ordem estável;
- UFs, distribuidoras, estimativas e componentes são ordenados antes da escrita;
- datas de coleta vêm do manifesto e não do relógio durante a geração;
- duas execuções com as mesmas entradas e configuração devem produzir arquivos
  idênticos;
- o script falha diante de competência incompleta, unidade desconhecida,
  duplicidade de par UF/distribuidora ou ausência de consumo para ponderação.

## Evolução

Mudanças incompatíveis incrementam `schemaVersion`. O consumidor deve rejeitar
versões desconhecidas com fallback para entrada manual.
