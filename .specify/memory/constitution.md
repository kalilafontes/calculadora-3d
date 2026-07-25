# Constituição do Projeto — Plataforma de Custos para Impressão 3D

## Princípios fundamentais

### I. Simplicidade para o usuário

Toda interação deve ser compreensível por uma pessoa sem conhecimento financeiro.
Termos técnicos devem ser explicados em linguagem simples, unidades devem estar
visíveis e os valores iniciais não devem induzir resultados incorretos. Quando uma
nova funcionalidade competir com clareza ou facilidade de uso, a solução mais
simples deve prevalecer.

### II. Regras de negócio independentes da interface

Fórmulas, validações financeiras e transformações de unidades devem ser
implementadas como funções puras, sem dependência de React, DOM, armazenamento ou
rede. A interface apenas coleta entradas, apresenta validações e exibe resultados.
Essa separação é obrigatória para permitir testes unitários e futuras integrações
com APIs, banco de dados e outros clientes.

### III. Correção financeira e transparência

Todo resultado deve ter fórmula e unidade documentadas. A aplicação deve revelar
ao usuário a composição do custo e não apenas o preço final. Entradas inválidas,
ausentes ou incompatíveis não podem produzir silenciosamente `NaN`, infinito ou
um resultado enganoso. Alterações nas fórmulas exigem atualização simultânea da
especificação e dos testes.

### IV. Qualidade verificável

As regras de cálculo devem possuir testes unitários cobrindo casos típicos,
limites, zeros, decimais e entradas inválidas. Cada história de usuário deve ser
validável de forma independente. Código novo só é considerado concluído quando
passa por verificação de tipos, testes automatizados e critérios de aceite da
história correspondente.

### V. Evolução incremental

O MVP contém apenas a calculadora de custos. Abstrações devem existir quando
protegem fronteiras reais — domínio, persistência e apresentação — e não para
antecipar funcionalidades hipotéticas. O armazenamento local deve ficar atrás de
um contrato substituível. Módulos futuros não devem ampliar o escopo da primeira
entrega.

### VI. Experiência responsiva, acessível e rápida

A funcionalidade principal deve operar em celular e desktop, com navegação por
teclado, rótulos associados aos campos, mensagens de erro compreensíveis e
contraste adequado. O recálculo deve parecer imediato durante a edição e não
depender de uma ação de envio. A interface deve evitar deslocamentos inesperados
e preservar legibilidade em telas pequenas.

## Restrições técnicas do MVP

- Aplicação frontend com React, TypeScript e Vite.
- Formulários com React Hook Form e esquemas de validação com Zod.
- Testes unitários com Vitest.
- Estilos encapsulados e desacoplados por CSS Modules ou solução equivalente.
- Persistência local atrás de uma interface de armazenamento; Local Storage é a
  implementação inicial.
- Nenhuma autenticação, backend ou banco de dados remoto no MVP.
- Valores monetários devem seguir uma estratégia consistente de precisão e
  arredondamento, documentada no plano técnico.

## Governança

Esta constituição prevalece sobre conveniências de implementação e preferências
individuais. Toda especificação e todo plano devem incluir uma verificação de
conformidade com estes princípios.

Mudanças nesta constituição exigem:

1. justificativa registrada;
2. avaliação de impacto sobre especificações, fórmulas e testes existentes;
3. atualização dos documentos afetados na mesma alteração.

**Versão**: 1.0.0  
**Ratificada em**: 2026-07-24  
**Última alteração**: 2026-07-24
