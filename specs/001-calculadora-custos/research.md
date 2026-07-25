# Pesquisa e decisões técnicas

## 1. Fonte de tarifas de energia

**Decisão**: usar dados oficiais da ANEEL como fonte e entregar ao frontend um
catálogo estático derivado e versionado.

**Motivo**: o MVP não possui backend; chamada externa no navegador introduziria
indisponibilidade, CORS, mudança de esquema e dependência de rede na função
principal.

**Fontes selecionadas**:

- SAMP/mercado das distribuidoras para consumo e receita faturada com tributos;
- tarifas homologadas (TUSD + TE) como fonte secundária;
- dados de bandeiras para rastreabilidade e verificações, sem somar novamente
  quando já estiverem incorporadas à receita faturada.

**Alternativas rejeitadas**:

- tarifa única nacional: imprecisa;
- média aritmética por UF: distorce UFs com distribuidoras de tamanhos diferentes;
- scraping de sites comerciais: fonte instável e sem garantia regulatória;
- API em tempo real no MVP: conflita com frontend autônomo e funcionamento local.

**Reprodutibilidade**: o catálogo é produzido por
`scripts/energy-data/generate-energy-catalog.mjs`. Um manifesto identifica cada
entrada bruta por URL exata, data de coleta, competência e integridade. O gerador
filtra B1 convencional, converte unidades, seleciona 12 meses completos, calcula
estimativas por par UF/distribuidora, pondera médias estaduais pelo consumo e
ordena a saída para que entradas idênticas produzam bytes idênticos.

## 2. Granularidade: UF e distribuidora

**Decisão**: UF obrigatória, distribuidora opcional e preço manual sempre
disponível.

**Motivo**: distribuidoras determinam melhor a tarifa, mas muitos usuários não
sabem qual empresa os atende. A média estadual mantém baixa a barreira de entrada.

**Precedência**:

```text
preço manual > estimativa da distribuidora > média ponderada da UF
```

**Classe de referência**: B1 residencial, modalidade convencional.

**Motivo**: é o enquadramento padrão mais adequado ao maker doméstico e mantém o
MVP simples. Usuários comerciais B3 ou de outras modalidades utilizam o campo
editável com o valor efetivo de sua conta. Seleção de classe tarifária fica para
uma evolução futura.

**Modelagem multi-estado**: o cadastro da distribuidora é separado de suas
estimativas. Cada `DistributorTariffEstimate` identifica exatamente um par
`{ stateCode, distributorId }`, permitindo valores diferentes quando a mesma
empresa atende mais de uma UF.

## 3. Período da estimativa

**Decisão**: média móvel dos 12 meses completos mais recentes.

**Motivo**: reduz oscilações mensais de bandeiras e sazonalidade, tornando a
estimativa mais útil para precificar produtos vendidos durante vários meses.

**Alternativa rejeitada**: último mês completo, por tornar preços de produtos
excessivamente sensíveis a condições temporárias.

## 4. Margem de lucro

**Decisão**: margem bruta sobre a venda:

```text
preço = custo / (1 - margem)
```

**Motivo**: expressa a parcela do preço que resta como lucro antes de custos não
modelados. A interface deve explicar que é diferente de markup.

## 5. Perdas

**Decisão**: aplicar perdas apenas a filamento e energia.

**Motivo**: uma falha de impressão normalmente repete consumo de material e
máquina; embalagem ainda não foi usada. Mão de obra adicional específica pode
ser incluída manualmente quando relevante.

## 6. Mão de obra

**Decisão**: oferecer tempo × valor/hora como padrão e valor direto como
alternativa.

**Motivo**: ensina a contabilizar trabalho sem impedir quem já conhece seu custo
por peça.

## 7. Valores monetários

**Decisão**: `number` finito no domínio, sem arredondamento intermediário, e
formatação somente na apresentação.

**Motivo**: as grandezas multiplicadas são pequenas e a estratégia é suficiente
para uma calculadora de estimativa. Se o produto evoluir para lançamentos
financeiros e contabilidade, deverá ser avaliado inteiro em centavos ou decimal
arbitrário.

## 8. Persistência

**Decisão**: repositório assíncrono em contrato, mesmo com implementação síncrona
de Local Storage.

**Motivo**: permite trocar por IndexedDB ou API sem alterar a feature. O contrato
assíncrono evita propagar a limitação síncrona do adaptador atual.

## 9. Estado de interface

**Decisão**: React Hook Form é a fonte das entradas; resultados são valores
derivados, não um segundo estado.

**Motivo**: evita divergência entre campos e resultados. Metadados do catálogo e
status de persistência são estados separados da feature.

## 10. Acessibilidade e responsividade

**Decisão**: HTML nativo para inputs e selects, grupos com `fieldset/legend`
quando aplicável, mensagens ligadas por `aria-describedby` e layout mobile-first.

**Motivo**: controles nativos oferecem comportamento consistente por teclado e
tecnologias assistivas com menor complexidade.

## 11. Vocabulário interno e apresentação

**Decisão**: tipos e enums usam inglês (`state`, `distributor`, `manual`);
rótulos e mensagens apresentados ao usuário usam português.

**Motivo**: elimina divergências entre os artefatos técnicos sem expor
vocabulário interno ao público.

## 12. Formatação

**Decisão**: Prettier formata o código e ESLint verifica qualidade estática.

**Motivo**: responsabilidades claras, configuração previsível e baixo custo de
manutenção.

## 13. Teste de usabilidade

**Decisão**: CS-001 é uma validação pós-deploy.

**Motivo**: exige participantes representativos e ambiente utilizável, mas não
deve impedir a primeira publicação técnica. A entrega deve incluir protocolo,
amostra mínima e forma de registro antes da divulgação ampla.
