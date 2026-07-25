# Catálogo de energia

O catálogo é derivado de dois conjuntos oficiais da ANEEL identificados em
`raw/manifest.json`: SAMP 2025 (mercado faturado) e PDD (relação entre CNPJ da
distribuidora e UF). Os CSVs brutos não são versionados devido ao tamanho.

## Método

O gerador mantém apenas mercado cativo regular, classe e subclasse residencial
(sem as faixas de baixa renda), subgrupo B1 e modalidade convencional. Para cada
distribuidora e competência, soma o
consumo `Energia TE (kWh)` e as parcelas `Receita Energia`, `Receita Bandeiras`,
`ICMS`, `PIS/PASEP` e `COFINS`, todas em reais. A divisão da receita total pelo
consumo já resulta em R$/kWh; portanto não há conversão R$/MWh neste caminho.

São selecionadas as 12 competências mais recentes do arquivo. A estimativa da
distribuidora é `receita total / consumo total`. A estimativa estadual pondera
as distribuidoras pelo consumo. Refaturamentos e geração distribuída são
excluídos. O resultado é uma aproximação B1 residencial convencional, não uma
reprodução de uma conta individual: iluminação pública, bandeira vigente,
benefícios, consumo mínimo e regras locais podem alterar o valor final.

## Atualização

1. Baixe os dois recursos nas URLs e nomes de `raw/manifest.json`.
2. Atualize os hashes e `retrievedAt` do manifesto.
3. Execute `npm run energy:generate`.
4. Execute `npm run energy:validate` e a suíte de testes.

Também é possível manter os arquivos fora do repositório:

```sh
node scripts/energy-data/generate-energy-catalog.mjs \
  --market=/caminho/samp-2025.csv \
  --states=/caminho/pdd-distribuicao-aneel.csv
```
