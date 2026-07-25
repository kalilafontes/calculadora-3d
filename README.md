# Quanto Cobrar 3D

Aplicação web para ajudar makers e pequenos negócios de impressão 3D a
descobrir o custo real de uma impressão e definir um preço de venda sustentável.

Em vez de considerar somente o filamento, o Quanto Cobrar 3D reúne material,
energia, tempo de impressão, mão de obra, embalagem, perdas e outros custos. O
resultado apresenta a composição do custo, o lucro estimado e um preço sugerido
com base na margem desejada.

## O que a V2 oferece

- cálculo de filamento, energia, perdas, mão de obra e custos adicionais;
- custos informados para a impressão completa, com quantidade de peças por mesa;
- preço da impressão e valores equivalentes por peça;
- preço sugerido usando margem bruta e lucro estimado;
- estimativa de energia por estado e distribuidora;
- perfil energético B1 residencial convencional, com valor do kWh editável;
- catálogo inicial das impressoras Bambu Lab A1 e A1 mini;
- potência oficial por tensão de 127 V ou 220 V, também editável;
- resultados atualizados em tempo real;
- restauração automática do último cálculo no navegador;
- cálculos nomeados salvos em IndexedDB;
- lista dos cinco cálculos recentes, com reabertura e exclusão;
- retorno suave ao topo ao reabrir um cálculo salvo;
- orçamento profissional em PDF com vendedor, cliente, quantidade e validade;
- logotipo e imagem da peça opcionais, com cálculo automático do total;
- prazo de produção, meios de pagamento, chave Pix, entrada e cuidados
  estruturados;
- tema claro e escuro;
- interface responsiva para celular e desktop.

## Projeto desenvolvido com SDD

Este projeto foi construído utilizando **SDD — Specification-Driven
Development**. Antes da implementação, o produto foi descrito por meio de
requisitos, regras de negócio, decisões arquiteturais, contratos e critérios de
validação.

Neste fluxo, a especificação não é apenas documentação posterior: ela orienta o
desenvolvimento.

```text
Constituição → Especificação → Pesquisa → Plano → Contratos → Tarefas → Código
                                      ↘ Testes e validação ↗
```

Essa abordagem ajudou a:

- definir claramente o escopo de cada versão;
- manter regras de cálculo separadas da interface;
- registrar decisões sobre margem, perdas e estimativas de energia;
- transformar requisitos em tarefas rastreáveis;
- validar consistência entre especificação, arquitetura, contratos e código;
- preparar a base para futuras funcionalidades sem antecipar complexidade.

### Artefatos do SDD

- [Constituição do projeto](.specify/memory/constitution.md)
- [Especificação do Quanto Cobrar 3D](specs/001-calculadora-custos/spec.md)
- [Pesquisa e decisões](specs/001-calculadora-custos/research.md)
- [Plano técnico](specs/001-calculadora-custos/plan.md)
- [Modelo de dados](specs/001-calculadora-custos/data-model.md)
- [Contrato de tarifas](specs/001-calculadora-custos/contracts/energy-tariffs.md)
- [Contrato de persistência](specs/001-calculadora-custos/contracts/persistence.md)
- [Tarefas de implementação](specs/001-calculadora-custos/tasks.md)
- [Análise cruzada dos artefatos](specs/001-calculadora-custos/analysis.md)
- [Guia de validação](specs/001-calculadora-custos/quickstart.md)

## Energia e dados da ANEEL

O catálogo embarcado utiliza dados oficiais da ANEEL para estimar o preço do
kWh por UF e distribuidora. O perfil padrão é B1 residencial convencional e o
período atualmente utilizado compreende janeiro a dezembro de 2025.

Os dados são processados por um gerador determinístico que filtra o perfil,
agrega as competências, pondera as médias por consumo e produz o JSON utilizado
pela aplicação. Nenhuma consulta externa é realizada enquanto o usuário utiliza
a calculadora.

As estimativas são referências aproximadas. Tributos locais, bandeiras,
benefícios tarifários e características da conta podem alterar o valor real;
por isso, o campo de energia permanece editável.

Consulte a
[documentação do catálogo de energia](scripts/energy-data/README.md) para
conhecer as fontes, o método e o processo de atualização.

## Stack

- React 19
- TypeScript
- Vite
- React Hook Form
- Zod
- CSS Modules
- Vitest e Testing Library
- Local Storage
- IndexedDB

O projeto permanece frontend-only. As regras de negócio são funções puras
e permanecem desacopladas dos componentes e dos adaptadores de infraestrutura.

## Executando localmente

Requisito: Node.js 22.13 ou superior.

```sh
git clone git@github.com:kalilafontes/calculadora-3d.git
cd calculadora-3d
npm install
npm run dev
```

## Qualidade

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run energy:validate
```

As fórmulas do domínio possuem cobertura obrigatória de 100%.

## Organização do código

```text
src/
├── domain/          # regras puras, tipos e validação do cálculo
├── features/        # formulário e experiência da calculadora
├── infrastructure/  # catálogo de energia, impressoras e persistência
└── shared/          # estilos, formatação e tema

scripts/energy-data/ # geração e validação do catálogo ANEEL
specs/               # artefatos do desenvolvimento orientado por especificação
```

## Persistência local

O rascunho mais recente continua salvo automaticamente no Local Storage. Os
cálculos nomeados usam IndexedDB e guardam título, entradas, resultado e datas
de criação e atualização. Os dados não saem do navegador e podem ser removidos
ao limpar os dados do site; não há sincronização entre dispositivos.

## Marca e domínio

O produto usa a marca **Quanto Cobrar 3D** e será publicado em
`quantocobrar3d.com`. As chaves técnicas legadas `calculadora3d:*` e o banco
IndexedDB `calculadora3d` são preservados para manter compatibilidade com os
rascunhos, temas e cálculos já salvos pelos usuários.

## Orçamentos em PDF

Um cálculo válido pode ser transformado em orçamento diretamente no navegador.
O documento apresenta somente o preço de venda, sem expor custo, lucro ou margem
ao cliente. Nome e contato do vendedor são lembrados localmente; dados do
cliente, observações e logotipo são usados apenas durante a geração do arquivo.
O PDF não é enviado a nenhum servidor.

As condições comerciais são preenchidas por controles simples: prazo em dias
úteis ou corridos, formas de pagamento, chave Pix condicional e percentual de
entrada com saldo calculado. Orientações padrão de cuidado podem ser incluídas
com uma única seleção, reduzindo a necessidade de escrever textos repetitivos.

Peso, tempo e demais custos representam a impressão completa mostrada pelo
fatiador, incluindo todas as peças e suportes da mesa. A quantidade de peças
serve para calcular os equivalentes unitários. O orçamento apresenta ao cliente
somente quantidade, preço por peça e total. Uma foto opcional pode identificar
visualmente o item e não é armazenada.

## Evolução planejada

A calculadora é o primeiro módulo de uma plataforma de gestão para pequenos
negócios de impressão 3D. Possíveis evoluções incluem renomear e duplicar
cálculos, exportar backups, cadastro de impressoras e materiais, estoque,
clientes, produtos, pedidos, orçamentos e relatórios.
