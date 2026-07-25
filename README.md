# Plataforma de custos para impressão 3D

Projeto orientado por especificação para uma calculadora de custos e preço de
venda de peças impressas em 3D.

## Artefatos atuais

- [Constituição do projeto](.specify/memory/constitution.md)
- [Especificação do MVP](specs/001-calculadora-custos/spec.md)
- [Plano técnico](specs/001-calculadora-custos/plan.md)
- [Pesquisa e decisões](specs/001-calculadora-custos/research.md)
- [Modelo de dados](specs/001-calculadora-custos/data-model.md)
- [Contrato de tarifas](specs/001-calculadora-custos/contracts/energy-tariffs.md)
- [Contrato de persistência](specs/001-calculadora-custos/contracts/persistence.md)
- [Guia de validação](specs/001-calculadora-custos/quickstart.md)
- [Tarefas de implementação](specs/001-calculadora-custos/tasks.md)
- [Análise cruzada](specs/001-calculadora-custos/analysis.md)

## Stack

React 19, TypeScript, Vite, React Hook Form, Zod, CSS Modules, Vitest e Local
Storage. A aplicação é frontend e não faz chamadas externas durante o uso.

## Desenvolvimento

```sh
npm install
npm run dev
```

Verificações disponíveis:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Arquitetura

- `src/domain/calculation`: regras puras e validadas do cálculo;
- `src/features/cost-calculator`: formulário, resultados e hooks da experiência;
- `src/infrastructure`: adaptadores locais de catálogo e persistência;
- `scripts/energy-data`: geração reproduzível do catálogo oficial da ANEEL.

O último cálculo válido é salvo localmente no navegador. Resultados derivados
não são persistidos. O catálogo embarcado usa uma estimativa B1 residencial
convencional por UF e distribuidora, mas o preço do kWh permanece editável.

Consulte [a documentação do catálogo](scripts/energy-data/README.md) para baixar
as fontes brutas, regenerar e validar os dados.
