# Tarefas: Calculadora de custos de impressão 3D

**Entrada**: artefatos em `specs/001-calculadora-custos/`  
**Pré-requisitos**: `spec.md`, `plan.md`, `research.md`, `data-model.md`,
`contracts/` e `quickstart.md`  
**Estratégia de testes**: testes são obrigatórios pelas constituição e spec.

## Convenções

- `[P]`: pode ser executada em paralelo com outras tarefas `[P]` da mesma fase,
  pois trabalha em arquivos independentes.
- `[US1]` a `[US4]`: história de usuário atendida.
- Tarefas sem rótulo de história são fundação ou acabamento compartilhado.
- Cada tarefa indica o caminho principal do arquivo a criar ou alterar.
- Uma história só é concluída quando seus testes independentes passam.

## Fase 1 — Preparação do projeto

**Objetivo**: criar a base executável e as verificações de qualidade.

- [x] T001 Inicializar o projeto React + TypeScript com Vite na raiz, preservando
      `.specify/` e `specs/`, e criar `package.json`, `vite.config.ts`,
      `tsconfig.json`, `index.html` e `src/main.tsx`
- [x] T002 Instalar e configurar React Hook Form, Zod e integração entre ambos em
      `package.json`
- [x] T003 Configurar Vitest, jsdom, Testing Library e Vitest Coverage em
      `vitest.config.ts` e `src/test/setup.ts`, exigindo 100% de linhas, funções,
      branches e statements em `src/domain/calculation/**`
- [x] T004 Configurar scripts `dev`, `build`, `typecheck`, `test`,
      `test:watch` e `lint` em `package.json`
- [x] T005 [P] Configurar ESLint para qualidade estática e Prettier para
      formatação de TypeScript/React em `eslint.config.js`, `.prettierrc` e arquivos
      associados
- [x] T006 [P] Criar reset mínimo, tokens de cor, espaçamento, tipografia,
      foco e breakpoints em `src/shared/styles/global.css`
- [x] T007 Criar a composição inicial da aplicação em `src/app/App.tsx` e
      conectar os estilos globais em `src/main.tsx`
- [x] T008 Executar `npm run typecheck`, `npm test` e `npm run build` e corrigir
      qualquer falha da fundação

**Checkpoint**: aplicação vazia abre localmente e todas as verificações passam.

---

## Fase 2 — Fundação do domínio e das fronteiras

**Objetivo**: estabelecer tipos, validação, contratos e adaptadores necessários
para que as histórias possam ser implementadas de forma independente.

- [x] T009 Definir `BrazilStateCode`, modos de mão de obra, origem de energia,
      `CalculationInput`, `CalculationResult` e enums internos em inglês em
      `src/domain/calculation/calculation.types.ts`
- [x] T010 [P] Implementar normalização de números pt-BR sem arredondamento em
      `src/domain/calculation/parsePtBrNumber.ts`
- [x] T011 [P] Criar esquema Zod das entradas, mensagens em português e limites
      de domínio em `src/domain/calculation/calculation.schema.ts`
- [x] T012 [P] Criar os contratos e tipos de catálogo de energia em
      `src/infrastructure/energy/EnergyTariffRepository.ts`, incluindo
      `EnergyEstimate`
- [x] T013 [P] Criar o contrato de draft persistido em
      `src/infrastructure/storage/CalculationDraftRepository.ts`
- [x] T014 Testar normalização, zeros, vírgula decimal, negativos, vazios,
      margem 100%, perdas e não finitos em
      `src/domain/calculation/calculation.schema.test.ts`
- [x] T015 Criar valores iniciais seguros do formulário em
      `src/features/cost-calculator/calculationDefaults.ts`
- [x] T016 Criar formatadores de BRL, percentuais, horas e energia em
      `src/shared/formatting/formatters.ts`
- [x] T017 [P] Testar formatadores sem realimentar valores arredondados no
      domínio em `src/shared/formatting/formatters.test.ts`

**Checkpoint**: entradas possuem um contrato único e todas as fronteiras futuras
estão tipadas.

---

## Fase 3 — História 1: calcular o custo real (P1)

**Objetivo**: permitir o cálculo completo e transparente de uma peça, incluindo
energia por UF/distribuidora.

**Teste independente**: preencher os dados de material, impressão e adicionais;
validar composição e total. Selecionar UF/distribuidora deve aplicar a estimativa
correta, e editar o kWh deve prevalecer.

### Testes da história 1

- [x] T018 [P] [US1] Criar testes das fórmulas de filamento, energia, perdas,
      mão de obra calculada/direta e total em
      `src/domain/calculation/calculateCosts.test.ts`
- [x] T019 [P] [US1] Criar testes do catálogo para 27 UFs, relações recíprocas,
      unidade R$/kWh, preços finitos, período, fonte e perfil B1 residencial
      convencional, incluindo unicidade do par UF/distribuidora, em
      `src/infrastructure/energy/energyCatalog.schema.test.ts`
- [x] T020 [P] [US1] Criar testes de seleção por UF, distribuidora, fallback
      estadual e ausência de estimativa em
      `src/infrastructure/energy/LocalEnergyTariffRepository.test.ts`

### Implementação da história 1

- [x] T021 [US1] Implementar a função pura `calculateCosts` sem arredondamentos
      intermediários em `src/domain/calculation/calculateCosts.ts`
- [x] T022 [US1] Criar esquema Zod e validação de invariantes do catálogo em
      `src/infrastructure/energy/energyCatalog.schema.ts`
- [x] T068 [US1] Implementar gerador determinístico do catálogo em
      `scripts/energy-data/generate-energy-catalog.mjs`, lendo entradas brutas
      identificadas em `scripts/energy-data/raw/manifest.json`, filtrando classe B1
      residencial e modalidade convencional, convertendo R$/MWh para R$/kWh,
      selecionando os 12 meses completos mais recentes, agregando estimativas por
      par UF/distribuidora, calculando médias estaduais ponderadas por consumo e
      escrevendo saída ordenada e reprodutível
- [x] T023 [US1] Gerar, por meio de T068, o catálogo inicial com as 27 UFs,
      distribuidoras, fonte,
      cadastros separados de estimativas por par UF/distribuidora, competência,
      método e perfil B1 residencial convencional em
      `src/infrastructure/energy/energy-tariffs.json`
- [x] T024 [US1] Validar que nenhum zero de exemplo ou placeholder seja publicado
      como tarifa real em `scripts/energy-data/validate-energy-catalog.mjs`
- [x] T025 [US1] Documentar obtenção, conversão R$/MWh → R$/kWh, média móvel e
      ponderação por consumo, incluindo filtros de classe B1 e modalidade
      convencional, em `scripts/energy-data/README.md`
- [x] T026 [US1] Implementar leitura do JSON, consulta estadual e consulta por
      par UF/distribuidora em
      `src/infrastructure/energy/LocalEnergyTariffRepository.ts`
- [x] T027 [P] [US1] Criar `NumberField` acessível com rótulo, unidade, descrição
      e erro associado em
      `src/features/cost-calculator/components/NumberField.tsx`
- [x] T028 [P] [US1] Criar seletor de UF com as 27 opções em
      `src/features/cost-calculator/components/StateSelect.tsx`
- [x] T029 [P] [US1] Criar seletor opcional de distribuidora filtrado pela UF e
      com “Não sei — usar média do estado” em
      `src/features/cost-calculator/components/DistributorSelect.tsx`
- [x] T030 [P] [US1] Criar painel acessível de composição do custo em
      `src/features/cost-calculator/components/CostBreakdown.tsx`
- [x] T031 [US1] Implementar hook que carrega catálogo, resolve precedência,
      redefine distribuidora ao trocar UF e preserva edição manual em
      `src/features/cost-calculator/hooks/useEnergyEstimate.ts`
- [x] T032 [US1] Implementar formulário com peso, filamento, tempo de impressão,
      potência, energia, embalagem, mão de obra, perdas e outros custos em
      `src/features/cost-calculator/components/CostCalculatorForm.tsx`
- [x] T033 [US1] Integrar React Hook Form, Zod, `calculateCosts`, seletores e
      composição em
      `src/features/cost-calculator/CostCalculatorPage.tsx`
- [x] T034 [US1] Exibir origem do kWh, fonte ANEEL, competência, método e aviso
      de aproximação e classe B1 residencial convencional em
      `src/features/cost-calculator/components/EnergyEstimateNotice.tsx`
- [x] T035 [US1] Implementar layout mobile-first da calculadora e composição em
      `src/features/cost-calculator/CostCalculatorPage.module.css`
- [ ] T036 [US1] Executar os cenários numéricos da história 1 e corrigir
      divergências entre domínio, catálogo e interface

**Checkpoint**: o usuário calcula e entende o custo total sem precisar da
história de preço sugerido ou da persistência.

---

## Fase 4 — História 2: preço sugerido e lucro (P1)

**Objetivo**: transformar custo total em decisão de preço usando margem bruta.

**Teste independente**: custo R$ 80,00 com margem de 20% deve produzir preço
R$ 100,00 e lucro R$ 20,00; margem 0% deve produzir lucro zero.

### Testes da história 2

- [ ] T037 [P] [US2] Adicionar testes de margem 0%, 20%, próxima de 100% e
      entrada inválida em `src/domain/calculation/calculateCosts.test.ts`
- [x] T038 [P] [US2] Testar atualização em tempo real e ausência de `NaN` ou
      infinito em
      `src/features/cost-calculator/CostCalculatorPage.test.tsx`

### Implementação da história 2

- [x] T039 [US2] Integrar preço sugerido e lucro ao resultado de domínio em
      `src/domain/calculation/calculateCosts.ts`
- [x] T040 [P] [US2] Criar resumo de preço com explicação curta de margem versus
      markup em
      `src/features/cost-calculator/components/PricingSummary.tsx`
- [x] T041 [US2] Integrar margem, preço e lucro com recálculo imediato em
      `src/features/cost-calculator/CostCalculatorPage.tsx`
- [ ] T042 [US2] Validar visualmente valores de custo R$ 80 com margens de 0% e
      20% conforme `quickstart.md`

**Checkpoint**: histórias 1 e 2 formam uma calculadora vendável e independente.

---

## Fase 5 — História 3: compreender e corrigir entradas (P2)

**Objetivo**: tornar o fluxo utilizável sem conhecimento financeiro e robusto
contra entradas inválidas.

**Teste independente**: tentar valores vazios, negativos, não numéricos e fora
dos limites; verificar mensagens, foco e ausência de resultados enganosos.

### Testes da história 3

- [ ] T043 [P] [US3] Testar rótulos, unidades, descrições, erros associados e
      navegação por teclado em
      `src/features/cost-calculator/components/CostCalculatorForm.test.tsx`
- [ ] T044 [P] [US3] Testar estados de carregamento/falha do catálogo e entrada
      manual em
      `src/features/cost-calculator/hooks/useEnergyEstimate.test.ts`
- [ ] T045 [P] [US3] Registrar e executar roteiro de validação responsiva para
      ausência de rolagem horizontal a 320 px em
      `specs/001-calculadora-custos/quickstart.md`

### Implementação da história 3

- [ ] T046 [P] [US3] Criar componente reutilizável de mensagem de campo em
      `src/shared/components/FieldMessage.tsx`
- [ ] T047 [P] [US3] Criar textos de ajuda simples para margem, perdas, potência,
      energia e mão de obra em
      `src/features/cost-calculator/calculationHelpText.ts`
- [ ] T048 [US3] Associar erros por `aria-describedby`, manter foco visível e
      impedir resultados inválidos em
      `src/features/cost-calculator/components/CostCalculatorForm.tsx`
- [ ] T049 [US3] Implementar fallback manual quando catálogo estiver ausente,
      inválido ou sem estimativa em
      `src/features/cost-calculator/hooks/useEnergyEstimate.ts`
- [ ] T050 [US3] Ajustar agrupamento, ordem visual, alvos de toque e leitura em
      320 px, tablet e desktop em
      `src/features/cost-calculator/CostCalculatorPage.module.css`
- [ ] T051 [US3] Realizar auditoria por teclado e tecnologia assistiva básica,
      registrando correções em
      `specs/001-calculadora-custos/quickstart.md`

**Checkpoint**: o fluxo principal pode ser concluído em celular e apenas por
teclado, com erros compreensíveis.

---

## Fase 6 — História 4: retomar e limpar o cálculo (P3)

**Objetivo**: restaurar o último cálculo válido sem tornar o armazenamento uma
dependência da calculadora.

**Teste independente**: salvar valores, recarregar e restaurar; corromper o dado
e continuar usando; limpar e retornar aos padrões.

### Testes da história 4

- [x] T052 [P] [US4] Testar load/save/clear, JSON corrompido, versão desconhecida
      e exceções do navegador em
      `src/infrastructure/storage/LocalStorageCalculationDraftRepository.test.ts`
- [ ] T053 [P] [US4] Testar restauração, debounce e limpeza no hook em
      `src/features/cost-calculator/hooks/useCalculationDraft.test.ts`
- [ ] T054 [P] [US4] Testar recarregamento e ação explícita de limpar em
      `tests/integration/calculation-persistence.test.tsx`

### Implementação da história 4

- [x] T055 [US4] Implementar schema versionado do draft em
      `src/infrastructure/storage/calculationDraft.schema.ts`
- [x] T056 [US4] Implementar adaptador resiliente de Local Storage usando apenas
      `calculadora3d:draft:v1` em
      `src/infrastructure/storage/LocalStorageCalculationDraftRepository.ts`
- [x] T057 [US4] Implementar restauração inicial, escrita válida com debounce e
      tratamento silencioso de indisponibilidade em
      `src/features/cost-calculator/hooks/useCalculationDraft.ts`
- [x] T058 [P] [US4] Criar botão de limpar com nome acessível em
      `src/features/cost-calculator/components/ClearCalculationButton.tsx`
- [x] T059 [US4] Integrar persistência e limpeza sem persistir resultados
      derivados em
      `src/features/cost-calculator/CostCalculatorPage.tsx`

**Checkpoint**: persistência é conveniente, versionada e não bloqueia nenhum
cálculo.

---

## Fase 7 — Acabamento e validação transversal

**Objetivo**: validar qualidade, rastreabilidade e prontidão do MVP.

- [x] T060 [P] Adicionar metadados da página, título, descrição e idioma pt-BR em
      `index.html`
- [x] T061 [P] Documentar instalação, scripts, arquitetura e atualização do
      catálogo em `README.md`
- [ ] T062 Revisar cada requisito RF-001 a RF-036 e RNF-001 a RNF-009 contra a
      implementação, registrando cobertura em
      `specs/001-calculadora-custos/checklists/requirements.md`
- [ ] T063 Executar a validação estrutural do catálogo e conferir manualmente
      pelo menos três distribuidoras B1 convencionais contra a fonte ANEEL,
      registrando competência e evidências em `scripts/energy-data/README.md`
- [ ] T064 Executar todos os cenários de `quickstart.md` e corrigir diferenças
      em `specs/001-calculadora-custos/quickstart.md`
- [ ] T065 Verificar que alterações válidas reflitam nos resultados em até
      100 ms no dispositivo de referência e registrar o método em
      `specs/001-calculadora-custos/quickstart.md`
- [ ] T066 Executar `npm run lint`, `npm run typecheck`, `npm test` e
      `npm run build`, corrigindo todas as falhas
- [ ] T067 Realizar revisão final de simplicidade, remover abstrações ou elementos
      não exigidos pelo MVP e confirmar ausência de chamadas externas no navegador
- [ ] T069 Criar protocolo pós-deploy de CS-001 em
      `specs/001-calculadora-custos/checklists/usability-study.md`, definindo pelo
      menos 5 participantes representativos, tarefa sem assistência, limite de 2
      minutos, consentimento sem coleta de dados sensíveis e registro da taxa de
      sucesso; executar após a primeira publicação e abrir correções se o resultado
      ficar abaixo de 90%
- [x] T070 [US1] Criar catálogo local de impressoras com Bambu Lab A1 e A1
      mini, seleção de 127/220 V, preenchimento da potência máxima oficial,
      edição manual, fonte e aviso de estimativa conservadora em
      `src/infrastructure/printers/` e
      `src/features/cost-calculator/components/PrinterSelect.tsx`

## Fase 8 — História 5: cálculos nomeados locais (V2)

**Objetivo**: permitir salvar, encontrar e retomar cálculos importantes sem
backend ou autenticação.

- [x] T071 [US5] Definir `SavedCalculation` e
      `SavedCalculationRepository` em
      `src/infrastructure/storage/SavedCalculationRepository.ts`
- [x] T072 [US5] Implementar banco IndexedDB `calculadora3d`, object store
      `saved-calculations`, índice `updatedAt` e operações de listar, salvar e
      excluir em
      `src/infrastructure/storage/IndexedDbSavedCalculationRepository.ts`
- [x] T073 [US5] Implementar hook de cálculos salvos com limite de cinco
      recentes, feedback e fallback não bloqueante em
      `src/features/cost-calculator/hooks/useSavedCalculations.ts`
- [x] T074 [US5] Criar formulário acessível para salvar um cálculo válido com
      título em `src/features/cost-calculator/components/SaveCalculation.tsx`
- [x] T075 [US5] Criar lista de recentes com título, data, abertura e exclusão
      individual em
      `src/features/cost-calculator/components/SavedCalculations.tsx`
- [x] T076 [US5] Integrar persistência nomeada à calculadora, restaurar todas as
      entradas e rolar suavemente ao topo após abertura em
      `src/features/cost-calculator/CostCalculatorPage.tsx`
- [x] T077 Atualizar README, especificação, pesquisa, plano, contrato, modelo,
      tarefas e quickstart para a V2
- [x] T078 Atualizar a versão do pacote para `2.0.0` e executar formatação, lint,
      typecheck, testes, build e validação do catálogo
- [x] T079 Adotar a marca Quanto Cobrar 3D, configurar metadados e domínio
      canônico `quantocobrar3d.com`, preservar as chaves legadas e atualizar o
      pacote para `2.0.1`
- [x] T080 Criar favicon vetorial responsivo à resolução com a paleta da marca e
      configurar sua descoberta no documento HTML

## Fase 9 — História 6: orçamento em PDF (V2.1)

- [x] T081 Definir e validar `QuotationData`, `SellerProfile` e campos do
      orçamento em `src/domain/quotation/`
- [x] T082 Criar persistência resiliente apenas do perfil do vendedor em
      `LocalStorageSellerProfileRepository`
- [x] T083 Criar ação e formulário acessível de orçamento com cliente, projeto,
      quantidade, validade, observações e logo opcional
- [x] T084 Gerar PDF A4 local com preço unitário, total, condições e identidade
      visual, sem custos internos, em `generateQuotationPdf.ts`
- [x] T085 Testar validação, persistência, abertura da interface e estrutura do
      PDF
- [x] T086 Renderizar amostra do PDF como imagem, revisar visualmente e corrigir
      problemas de compatibilidade
- [x] T087 Atualizar documentação e versão do pacote para `2.1.0`
- [x] T088 Substituir condições abertas por prazo estruturado, formas de
      pagamento, chave Pix condicional, percentual de entrada, saldo calculado e
      cuidados padrão selecionáveis
- [x] T089 Tratar peso, tempo e custos como totais da impressão completa, incluir
      peças por impressão e derivar custo, preço e lucro unitários
- [x] T090 Apresentar o orçamento ao cliente por quantidade e preço por peça,
      usando o valor unitário derivado da impressão completa
- [x] T091 Atualizar PDF, interface, testes e documentação para o modelo de mesa
      completa
- [x] T092 Permitir imagem transitória e opcional da peça junto ao item do PDF

## Dependências entre fases

```text
Fase 1: Preparação
  ↓
Fase 2: Fundação
  ↓
Fase 3: US1 — custo real
  ├──→ Fase 4: US2 — preço e lucro
  ├──→ Fase 5: US3 — usabilidade e erros
  └──→ Fase 6: US4 — persistência
             ↓
Fase 7: Validação transversal
             ↓
Fase 8: US5 — cálculos nomeados (V2)
```

- Fases 4, 5 e 6 dependem da história 1, mas podem avançar em paralelo entre si.
- T068 deve ser concluída antes de T023; seu ID foi acrescentado posteriormente
  para preservar a numeração e referências das tarefas existentes.
- A história 1 é o primeiro incremento demonstrável.
- A história 2 completa o valor comercial central do MVP.
- Histórias 3 e 4 não devem alterar fórmulas do domínio.
- A história 5 depende das entradas e resultados estáveis das histórias 1 e 2,
  mas mantém falhas de armazenamento isoladas do cálculo.

## Oportunidades de paralelismo

### Fundação

Após T009, T010–T013 podem avançar em paralelo. T016 pode avançar junto dos
contratos, pois não depende dos adaptadores.

### História 1

T018–T020 podem ser escritos em paralelo. Após os contratos, T027–T030 podem ser
construídos em paralelo enquanto T021–T026 implementam domínio e catálogo.

### Histórias

Depois do checkpoint da história 1:

- um fluxo pode implementar preço e lucro;
- outro pode trabalhar acessibilidade e mensagens;
- outro pode implementar persistência.

## Estratégia de entrega

### Incremento 1 — Calculadora de custo

Concluir fases 1–3 e demonstrar custo real com energia estadual/distribuidora.

### Incremento 2 — Decisão de preço

Adicionar fase 4 e demonstrar custo, preço sugerido e lucro.

### Incremento 3 — MVP completo

Adicionar fases 5–7, persistência, acessibilidade e verificações finais.

### Incremento 4 — V2 local-first

Adicionar fase 8, com cálculos nomeados em IndexedDB e acesso aos recentes.

## Definição de pronto por tarefa

- implementação e testes relacionados passam;
- caminhos, tipos e nomes respeitam o plano;
- nenhuma regra de negócio é duplicada na interface;
- mensagens e rótulos estão em português claro;
- dados estimados exibem fonte e competência;
- não há `NaN`, infinito ou placeholder apresentado como resultado válido.
