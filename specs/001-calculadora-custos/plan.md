# Plano de implementação: Calculadora de custos de impressão 3D

**Branch**: `001-calculadora-custos`  
**Spec**: [spec.md](spec.md)  
**Data**: 2026-07-24

## Resumo

Construir uma aplicação frontend responsiva que calcula custos e preço sugerido
de uma impressão 3D em tempo real. O domínio será isolado da interface; entradas
serão validadas com Zod e controladas com React Hook Form. Preferências e último
cálculo válido serão persistidos por um repositório de Local Storage. Estimativas
de energia por UF e distribuidora serão consumidas de um catálogo JSON local,
versionado e rastreável até dados oficiais da ANEEL.

## Contexto técnico

| Item                       | Decisão                                                       |
| -------------------------- | ------------------------------------------------------------- |
| Linguagem                  | TypeScript em modo estrito                                    |
| Interface                  | React                                                         |
| Build e desenvolvimento    | Vite                                                          |
| Formulários                | React Hook Form                                               |
| Validação                  | Zod                                                           |
| Testes                     | Vitest + Testing Library para comportamento de interface      |
| Cobertura                  | Vitest Coverage com 100% para fórmulas e limites do domínio   |
| Estilos                    | CSS Modules com tokens CSS globais mínimos                    |
| Formatação                 | Prettier; ESLint permanece responsável por qualidade estática |
| Persistência               | Local Storage atrás de `CalculationDraftRepository`           |
| Dados de energia           | JSON estático atrás de `EnergyTariffRepository`               |
| Classe de energia estimada | B1 residencial, modalidade convencional                       |
| Backend/autenticação       | Não existem no MVP                                            |
| Idioma/moeda               | pt-BR e BRL                                                   |
| Navegadores                | versões modernas com suporte a módulos ES                     |

## Verificação da constituição

| Princípio                | Como o plano atende                                     | Status |
| ------------------------ | ------------------------------------------------------- | ------ |
| Simplicidade             | fluxo único, distribuidora opcional e valores editáveis | PASS   |
| Domínio independente     | funções puras em `domain/calculation`                   | PASS   |
| Correção e transparência | composição, fonte, competência e origem visíveis        | PASS   |
| Qualidade verificável    | testes de domínio, adaptadores e histórias              | PASS   |
| Evolução incremental     | apenas duas interfaces nas fronteiras reais             | PASS   |
| Responsividade e acesso  | mobile-first, teclado, rótulos e erros associados       | PASS   |

Nenhuma violação constitucional é necessária.

## Estrutura do código

```text
src/
├── app/
│   ├── App.tsx
│   └── providers/
├── domain/
│   └── calculation/
│       ├── calculateCosts.ts
│       ├── calculation.schema.ts
│       ├── calculation.types.ts
│       └── calculateCosts.test.ts
├── features/
│   └── cost-calculator/
│       ├── components/
│       ├── hooks/
│       ├── CostCalculatorPage.tsx
│       └── CostCalculatorPage.module.css
├── infrastructure/
│   ├── energy/
│   │   ├── LocalEnergyTariffRepository.ts
│   │   └── energy-tariffs.json
│   └── storage/
│       └── LocalStorageCalculationDraftRepository.ts
├── shared/
│   ├── components/
│   ├── formatting/
│   └── styles/
└── main.tsx

scripts/
└── energy-data/
    ├── README.md
    ├── generate-energy-catalog.mjs
    ├── raw/
    │   └── manifest.json
    └── validate-energy-catalog.mjs

tests/
└── integration/
```

### Decisão de estrutura

Um único projeto frontend é suficiente. A separação será por domínio, feature e
infraestrutura dentro de `src`; não haverá pacote compartilhado prematuro nem
estrutura de backend vazia.

## Arquitetura e fluxo de dados

```text
Formulário React
    ↓ entrada validada
Função pura calculateCosts
    ↓ resultado derivado
Resumo de custos

UF/distribuidora → EnergyTariffRepository → catálogo JSON local → preço sugerido
Formulário válido → CalculationDraftRepository → Local Storage
```

- O resultado nunca será persistido como fonte de verdade; será recalculado.
- Trocar UF redefine distribuidora e aplica a média estadual.
- Selecionar distribuidora substitui a média estadual.
- Editar o preço do kWh muda sua origem para `manual`; alterações posteriores de
  UF/distribuidora aplicam uma nova estimativa e retornam a origem a `estimado`.
- Falhas nos repositórios são convertidas em fallback seguro na camada da feature.

## Precisão numérica e arredondamento

- Entradas permanecem em unidades humanas: g, kg, W, h, kWh e percentuais.
- O domínio usa `number` finito após validação, sem arredondar etapas
  intermediárias.
- A apresentação monetária usa `Intl.NumberFormat("pt-BR", { currency: "BRL" })`.
- Comparações de teste usam valores de referência e tolerância explícita para
  ponto flutuante (`toBeCloseTo`).
- O preço persistido conserva a precisão do catálogo/entrada; formatação visual
  não volta para o domínio.

## Estratégia de formulário

- `mode: "onChange"` para feedback e recálculo imediato.
- Campos exibem unidade no rótulo ou sufixo visual.
- Texto digitado em pt-BR será normalizado em uma função testada antes da
  validação numérica.
- Resultados completos aparecem apenas quando as entradas necessárias são
  válidas; durante erro, preserva-se a estrutura do resumo com orientação clara.
- Mão de obra começa em modo calculado e permite alternar para valor direto.

## Estratégia de tarifas de energia

- O runtime lê apenas o catálogo local descrito em `contracts/energy-tariffs.md`.
- O catálogo contém médias móveis de 12 meses por distribuidora e médias estaduais
  ponderadas pelo consumo, filtradas para B1 residencial convencional.
- Cadastros de distribuidoras não contêm preços. As estimativas são registros
  separados e únicos por par UF/distribuidora.
- A interface identifica a classe usada na estimativa e orienta usuários
  comerciais a informar manualmente seu valor real de R$/kWh.
- A geração do catálogo é uma atividade de manutenção, não uma chamada do
  navegador à ANEEL.
- A geração é determinística a partir de entradas brutas registradas em
  manifesto, com filtros B1 convencional, conversão de unidades, janela de 12
  meses, estimativas por par UF/distribuidora e ponderação estadual por consumo.
- A publicação exige fonte, competência, método, manifesto de entrada, gerador e
  validação estrutural.
- Uma futura API implementará o mesmo `EnergyTariffRepository`.

## Estratégia de persistência

- Chave: `calculadora3d:draft:v1`.
- Payload com `schemaVersion: 1`, entradas e `savedAt`.
- Leitura sempre passa por Zod; conteúdo inválido ou desconhecido é ignorado.
- Escrita acontece somente para um formulário válido, com debounce curto.
- Limpar remove apenas a chave pertencente à aplicação.
- Exceções de quota, privacidade ou acesso não interrompem o cálculo.

## Estratégia de testes

1. **Domínio**: todas as fórmulas, zeros, limites, margem, perdas e mão de obra.
2. **Esquemas**: vírgula decimal, negativos, vazios, limites e valores não finitos.
3. **Tarifas**: seleção por UF, distribuidora, fallback e metadados.
4. **Persistência**: leitura válida, versão inválida, JSON corrompido e falha de
   armazenamento.
5. **Componentes**: recálculo, mensagens, origem manual/estimada e limpeza.
6. **Integração**: um cenário completo de cada história de usuário.

O Vitest deve aplicar limiar de 100% de linhas, funções, branches e statements
em `src/domain/calculation/**`, excluindo arquivos exclusivamente declarativos
quando justificado e documentado.

## Fases de implementação

### Fase 1 — Fundação

Inicializar Vite/React/TypeScript, qualidade, testes, tokens visuais e estrutura.

### Fase 2 — Domínio

Implementar tipos, esquema, normalização, fórmulas puras e testes unitários.

### Fase 3 — Energia e persistência

Criar contratos, adaptadores locais, catálogo inicial e tratamentos de fallback.

### Fase 4 — Experiência principal

Construir formulário, seletores dependentes, composição de custos e preço
sugerido com layout responsivo e acessível.

### Fase 5 — Robustez

Adicionar persistência, limpeza, testes de integração, auditoria de acessibilidade
e verificação de desempenho percebido.

## Riscos e mitigação

| Risco                                           | Mitigação                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| Usuário interpretar estimativa como valor exato | rótulo “estimativa”, fonte, competência e edição manual            |
| Distribuidora atuar em mais de uma UF           | cadastro separado e estimativa específica por par UF/distribuidora |
| Dados ANEEL incompletos/defasados               | competência visível, fallback estadual/manual                      |
| Fórmula de margem confundida com markup         | ajuda contextual e exemplo de R$ 80 → R$ 100                       |
| Local Storage corrompido                        | validação versionada e fallback sem bloqueio                       |
| Excesso de campos no celular                    | agrupamento progressivo sem esconder resultados                    |

## Critérios de saída do planejamento

- Modelo de dados definido.
- Contratos de tarifas e persistência definidos.
- Pesquisa registra todas as decisões técnicas relevantes.
- Guia de validação cobre histórias e cenários numéricos.
- Nenhuma pendência bloqueadora permanece antes da geração de `tasks.md`.
