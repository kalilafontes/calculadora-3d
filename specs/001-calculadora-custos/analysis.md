# Análise cruzada dos artefatos

**Data**: 2026-07-25
**Escopo**: constituição, spec, plano, pesquisa, modelo de dados, contratos,
quickstart e tarefas  
**Método**: revisão de consistência, rastreabilidade, cobertura, ambiguidades,
conformidade constitucional e prontidão para implementação  
**Resultado**: **PRONTO PARA IMPLEMENTAÇÃO**

## Resumo executivo

Os artefatos estão alinhados quanto ao objetivo do produto, fórmulas principais,
separação entre domínio e interface, persistência local, acessibilidade e evolução
arquitetural. A V2 acrescenta uma quinta história para cálculos nomeados em
IndexedDB, sem alterar o domínio financeiro nem introduzir backend.

Foram encontrados:

| Severidade |               Quantidade |
| ---------- | -----------------------: |
| Crítica    |                        0 |
| Alta       | 0 abertas + 3 resolvidas |
| Média      | 0 abertas + 5 resolvidas |
| Baixa      | 0 abertas + 3 resolvidas |

Todos os achados foram resolvidos ou, no caso de CS-001, classificados como
validação pós-deploy. Não há bloqueio documental para iniciar a implementação.

## Cobertura

### Histórias

| História                | Spec | Plano | Testes/tarefas | Situação                         |
| ----------------------- | ---- | ----- | -------------- | -------------------------------- |
| US1 — custo real        | Sim  | Sim   | T018–T036      | Coberta com ressalvas de energia |
| US2 — preço e lucro     | Sim  | Sim   | T037–T042      | Coberta                          |
| US3 — entradas e acesso | Sim  | Sim   | T043–T051      | Coberta                          |
| US4 — persistência      | Sim  | Sim   | T052–T059      | Coberta                          |
| US5 — cálculos nomeados | Sim  | Sim   | T071–T078      | Implementada na V2               |

### Requisitos

- RF-001 a RF-025 possuem cobertura de implementação nas fases 2–6.
- RNF-001 a RNF-009 possuem cobertura parcial ou total nas fases 5, 7 e 8.
- CS-002 a CS-005 possuem atividades de verificação.
- CS-001 possui protocolo pós-deploy previsto em T069.

### Constituição

| Princípio              | Evidência                                      | Resultado |
| ---------------------- | ---------------------------------------------- | --------- |
| Simplicidade           | distribuidora opcional e fallback estadual     | Conforme  |
| Domínio independente   | `calculateCosts` puro e contratos de fronteira | Conforme  |
| Correção/transparência | fórmulas, composição, fonte e competência      | Conforme  |
| Qualidade verificável  | testes por história e validação final          | Conforme  |
| Evolução incremental   | projeto único e duas abstrações de fronteira   | Conforme  |
| Responsividade/acesso  | tarefas de teclado, 320 px e erros associados  | Conforme  |

## Achados

### A01 — Classe e modalidade tarifária não estão definidas — RESOLVIDO

**Severidade**: Alta  
**Resolução em 2026-07-24**: adotada classe B1 residencial, modalidade
convencional, com valor editável para usuários comerciais e outras classes. A
decisão foi propagada para spec, plano, pesquisa, modelo, contrato, tarefas e
quickstart.

**Artefatos**: `spec.md`, `plan.md`, `research.md`, contrato de energia  
**Princípio afetado**: correção financeira e transparência

Os dados da ANEEL distinguem classes e subgrupos tarifários. Os artefatos não
definem se a estimativa representa residencial B1 convencional, comercial B3 ou
outra categoria. O público inclui tanto makers domésticos quanto pequenos
negócios; portanto, a escolha pode mudar materialmente o preço do kWh.

**Risco**: catálogo tecnicamente válido, mas semanticamente indefinido.

**Remediação recomendada**:

1. adotar B1 residencial convencional como padrão explícito do MVP, por
   simplicidade e predominância esperada de makers domésticos;
2. informar essa classe junto à fonte e competência;
3. manter preço manual para negócios B3;
4. considerar seleção de classe tarifária em versão futura;
5. incluir `consumerClass` e `tariffModality` no contrato do catálogo.

### A02 — Modelo de distribuidora não suporta tarifa distinta por UF — RESOLVIDO

**Severidade**: Alta  
**Resolução em 2026-07-24**: o cadastro `Distributor` foi separado de
`DistributorTariffEstimate`. Cada estimativa agora representa um único par
`{ stateCode, distributorId }`, com invariantes de unicidade, referência e
reciprocidade propagadas para modelo, contrato, spec, plano, pesquisa, tarefas e
quickstart.

**Artefatos**: `data-model.md`, `contracts/energy-tariffs.md`  
**Requisitos afetados**: RF-022, RF-023, RNF-008

`DistributorTariff` possui `stateCodes: UF[]`, mas apenas um
`averagePricePerKwh`. Caso um agente atenda mais de uma UF e os valores sejam
diferentes, o modelo não consegue representar a estimativa correta do par
UF/distribuidora. O repositório já consulta pelos dois identificadores, portanto
o contrato deveria preservar essa granularidade.

**Risco**: aplicar em uma UF a média calculada para outra área.

**Remediação recomendada**: modelar `DistributorTariffEstimate` como uma entrada
por par `{ stateCode, distributorId, averagePricePerKwh }`, mantendo os dados
cadastrais da distribuidora separados, ou usar uma coleção `estimatesByState`
dentro da distribuidora.

### A03 — Não existe tarefa de geração reproduzível do catálogo — RESOLVIDO

**Severidade**: Alta  
**Resolução em 2026-07-24**: adicionada T068 para implementar
`scripts/energy-data/generate-energy-catalog.mjs`, com manifesto de entradas
brutas, filtros B1 convencional, conversão de unidades, janela de 12 meses,
estimativas por par UF/distribuidora, ponderação estadual e saída determinística.
Plano, pesquisa, contrato, quickstart e spec foram atualizados.

**Artefatos**: `plan.md`, `tasks.md`, `contracts/energy-tariffs.md`  
**Requisitos afetados**: RF-017, RF-020, RF-023, RNF-008

T023 solicita criar o catálogo, T024 valida placeholders e T025 documenta o
processo, mas nenhuma tarefa implementa a transformação reproduzível dos dados
ANEEL em médias móveis ponderadas. A constituição exige transparência e o plano
afirma que a manutenção será reproduzível.

**Risco**: preenchimento manual sem auditabilidade ou uso acidental de números
não verificáveis.

**Remediação recomendada**: acrescentar tarefa para um script como
`scripts/energy-data/generate-energy-catalog.mjs`, com entradas brutas
identificadas, filtros de classe/modalidade, conversão de unidades, janela de 12
meses, ponderação e saída determinística.

### M01 — Tipo `EnergyEstimate` é usado, mas não definido — RESOLVIDO

**Severidade**: Média  
**Resolução em 2026-07-24**: `EnergyEstimate` foi definido com preço, origem,
UF, distribuidora opcional, fonte, período e perfil tarifário.

**Artefato**: `data-model.md`

As assinaturas de `EnergyTariffRepository` retornam `EnergyEstimate`, porém esse
tipo não aparece no modelo.

**Remediação**: definir campos mínimos `pricePerKwh`, `origin`, `stateCode`,
`distributorId?`, `source`, `referencePeriod` e `method`.

### M02 — Vocabulário da origem de energia diverge — RESOLVIDO

**Severidade**: Média  
**Resolução em 2026-07-24**: código e tipos usam `state`, `distributor` e
`manual`; a interface traduz os valores para português.

**Artefatos**: `spec.md`, `data-model.md`, `plan.md`

A spec usa `estado | distribuidora | manual`; o modelo usa
`state | distributor | manual`; o plano usa o termo genérico `estimado` em alguns
trechos.

**Remediação**: escolher um único vocabulário no código e documentar sua tradução
para a interface. Recomendação: enums de código em inglês e rótulos pt-BR.

### M03 — Cobertura de 100% do domínio não está configurada — RESOLVIDO

**Severidade**: Média  
**Resolução em 2026-07-24**: plano e T003 exigem Vitest Coverage com 100% de
linhas, funções, branches e statements no domínio de cálculo.

**Artefatos**: constituição, RNF-006, `tasks.md`

Há tarefas de testes para fórmulas e limites, mas nenhuma configura limiares de
cobertura no Vitest. A exigência “100% das fórmulas e limites de domínio” pode ser
interpretada como cobertura comportamental, porém não há mecanismo que impeça
regressão.

**Remediação**: em T003/T004, configurar cobertura para
`src/domain/calculation/**` e um limiar explícito compatível com RNF-006.

### M04 — CS-001 não possui tarefa de validação com usuários — RESOLVIDO

**Severidade**: Média  
**Resolução em 2026-07-24**: CS-001 foi classificado como pós-deploy e T069
define protocolo, amostra mínima, limite de tempo, registro e ação corretiva.

**Artefatos**: `spec.md`, `tasks.md`

O critério requer que 90% de participantes representativos concluam o fluxo em
até dois minutos, mas as tarefas não definem amostra, roteiro ou registro.

**Remediação**: adicionar um protocolo simples de teste de usabilidade, definir
quantidade mínima de participantes e registrar resultados. Se isso não fizer
parte da entrega técnica inicial, marcar CS-001 como validação pós-deploy.

### M05 — Origem de dados brutos e retenção de evidência são insuficientes — RESOLVIDO

**Severidade**: Média  
**Resolução em 2026-07-24**: o manifesto de entradas passou a exigir URL exata,
data de coleta, competência e hash. O gerador determinístico e a validação em
quickstart preservam a rastreabilidade da transformação.

**Artefatos**: pesquisa, contrato e tarefas

Os documentos apontam o portal ANEEL, mas não fixam o recurso/arquivo utilizado,
campos filtrados nem como a versão de entrada será preservada. Apenas a URL geral
não basta para reproduzir uma tabela histórica se a fonte for atualizada.

**Remediação**: registrar URL exata, hash/data de coleta, dicionário de campos e
arquivo bruto ou manifesto de origem no processo de geração.

### B01 — Campo de mão de obra é ambíguo na lista da spec — RESOLVIDO

**Severidade**: Baixa  
**Resolução em 2026-07-24**: a entrada foi renomeada para
`custoMaoDeObraDireto`; `custoMaoDeObra` permanece resultado derivado.

**Artefatos**: `spec.md`, `data-model.md`

A lista de entradas conserva `custoMaoDeObra` junto aos campos condicionais,
enquanto o modelo distingue `directLaborCost` do resultado `laborCost`.

**Remediação**: renomear na spec para `custoMaoDeObraDireto` e afirmar que
`custoMaoDeObra` é sempre derivado.

### B02 — Exemplo JSON com tarifa zero pode ser copiado indevidamente — RESOLVIDO

**Severidade**: Baixa  
**Resolução em 2026-07-24**: zeros foram substituídos por marcadores textuais,
tornando o exemplo intencionalmente inválido perante o schema de publicação.

**Artefato**: `contracts/energy-tariffs.md`

O contrato avisa que os zeros são placeholders, e T024 deve bloqueá-los. Mesmo
assim, o exemplo é estruturalmente parecido com um catálogo utilizável.

**Remediação**: usar valores textuais inválidos em pseudocódigo ou marcar o bloco
como “não válido”; conservar o teste que rejeita zero como estimativa publicada.

### B03 — Ferramenta de formatação não foi escolhida — RESOLVIDO

**Severidade**: Baixa  
**Resolução em 2026-07-24**: Prettier foi escolhido para formatação e ESLint
permanece responsável por qualidade estática.

**Artefatos**: `tasks.md`, `plan.md`

T005 menciona lint e formatação, mas o contexto técnico não decide entre
Prettier, formatter do ESLint ou outra solução.

**Remediação**: selecionar a opção mais simples durante T005 e registrá-la no
README; não exige alteração da spec.

## Matriz resumida de rastreabilidade

| Área                       | Requisitos                | Plano/contrato           | Tarefas                           | Avaliação |
| -------------------------- | ------------------------- | ------------------------ | --------------------------------- | --------- |
| Material e impressão       | RF-001–RF-004             | domínio/cálculo          | T009–T021, T032                   | Completa  |
| Custos adicionais e perdas | RF-005–RF-007, RF-024     | domínio/cálculo          | T018, T021, T032                  | Completa  |
| Preço e lucro              | RF-008–RF-009             | domínio/UI               | T037–T042                         | Completa  |
| Apresentação e validação   | RF-010–RF-012             | feature/acesso           | T027, T030, T043–T051             | Completa  |
| Persistência               | RF-013–RF-014, RF-030–036 | contrato de persistência | T052–T059, T071–T078              | Completa  |
| Responsividade/acesso      | RF-015, RNF-001–RNF-004   | CSS/HTML nativo          | T043–T051, T065                   | Completa  |
| Energia por UF             | RF-016–RF-021, RF-025     | catálogo/repositório     | T019–T036, T068                   | Completa  |
| Distribuidora              | RF-022–RF-023             | catálogo/repositório     | T020, T023, T026, T029–T031, T068 | Completa  |
| Robustez e privacidade     | RNF-005–RNF-007           | adaptadores locais       | T044, T049, T052–T059             | Completa  |
| Rastreabilidade            | RNF-008                   | contrato/catálogo        | T019, T023–T025, T034, T063, T068 | Completa  |

## Duplicação e complexidade

- Não há duplicação material entre spec e plano; a primeira define o que e o
  segundo define como.
- Os dois repositórios abstratos são justificados por fronteiras substituíveis
  reais, não configurando abstração prematura.
- React Hook Form + Zod introduzem duas camadas relacionadas, mas têm papéis
  distintos: estado do formulário e validação do domínio de entrada.
- Não há backend, autenticação, estado global ou design system desnecessário.

## Ordem recomendada de remediação

Todas as remediações foram propagadas. Nenhuma ação documental permanece antes
da implementação.

## Gate de prontidão

| Etapa                                           | Situação                        |
| ----------------------------------------------- | ------------------------------- |
| T001–T017: fundação                             | Pode iniciar                    |
| T018–T022: domínio e schemas                    | Pode iniciar                    |
| T023 em diante: catálogo e interface de energia | Pode iniciar após T068          |
| Implementação completa do MVP                   | Sem bloqueio de severidade alta |

Não há conflito que exija mudar a visão do produto ou a constituição. O conjunto
documental está pronto para iniciar por T001, respeitando T068 como dependência
de T023 e T069 como validação pós-deploy.
