# Especificação da funcionalidade: Calculadora de custos de impressão 3D

**Branch sugerida**: `001-calculadora-custos`  
**Criada em**: 2026-07-24  
**Status**: V2 implementada

**Entrada original**: Criar o MVP de uma plataforma web que calcule o custo real
e sugira o preço de venda de peças impressas em 3D.

## Visão geral

A calculadora ajuda makers e pequenos vendedores de impressão 3D a entender o
custo de produção de uma peça e definir um preço de venda sustentável. Ela reúne
material, energia, embalagem, mão de obra, custos adicionais e perdas em uma
única experiência, apresentando a composição do custo, o lucro estimado e o preço
sugerido em tempo real.

O produto é apresentado ao público como **Quanto Cobrar 3D**, no domínio
`quantocobrar3d.com`. O título principal da experiência é “Quanto cobrar pela
sua impressão 3D?”.

## Histórias de usuário e validação

### História 1 — Calcular o custo real da peça (Prioridade P1)

Como maker, quero informar os dados de uma impressão para saber quanto custa
produzir uma unidade sem precisar montar uma planilha.

**Por que é P1**: é o valor central do MVP e pode ser usado mesmo sem a sugestão
de preço de venda.

**Teste independente**: preencher os dados de material, impressão e custos
adicionais e conferir se a composição e o custo total correspondem às fórmulas
documentadas.

**Cenários de aceite**

1. **Dado** peso de 100 g e filamento a R$ 100,00/kg, **quando** o usuário
   informar esses valores, **então** o custo do filamento será R$ 10,00.
2. **Dado** uma impressão de 2 horas, potência de 200 W e energia estimada em
   R$ 1,00/kWh para a UF selecionada, **quando** os dados forem informados,
   **então** o custo de energia será R$ 0,40.
3. **Dado** que os campos válidos foram preenchidos, **quando** qualquer entrada
   for alterada, **então** todos os resultados afetados serão atualizados sem
   exigir um botão de calcular.
4. **Dado** um cálculo válido, **quando** o resultado for exibido, **então** o
   usuário verá separadamente custo de filamento, energia, perdas, embalagem,
   mão de obra, outros custos e custo total.
5. **Dado** que o usuário selecionou uma UF, **quando** a seleção for alterada,
   **então** o preço do kWh será preenchido com a estimativa correspondente e o
   sistema identificará a fonte e a data de referência.
6. **Dado** que o valor real da conta do usuário difere da estimativa, **quando**
   ele editar o preço do kWh, **então** o valor informado manualmente prevalecerá
   no cálculo.
7. **Dado** que uma UF possui distribuidoras cadastradas, **quando** o usuário
   selecionar uma delas, **então** será usada a estimativa da distribuidora.
8. **Dado** que o usuário não sabe sua distribuidora, **quando** escolher usar a
   média estadual, **então** a calculadora usará a estimativa agregada da UF.

---

### História 2 — Obter preço sugerido e lucro (Prioridade P1)

Como vendedor, quero aplicar uma margem desejada ao custo total para conhecer o
preço mínimo sugerido e o lucro estimado por unidade.

**Por que é P1**: transforma o cálculo de custo em uma decisão prática de venda.

**Teste independente**: usar um custo total conhecido e uma margem conhecida e
conferir preço e lucro pelas fórmulas documentadas.

**Cenários de aceite**

1. **Dado** custo total de R$ 80,00 e margem desejada de 20%, **quando** o
   cálculo for válido, **então** o preço sugerido será R$ 100,00 e o lucro será
   R$ 20,00.
2. **Dado** margem de 0%, **quando** o cálculo for válido, **então** o preço
   sugerido será igual ao custo total e o lucro será zero.
3. **Dado** margem inválida, **quando** o usuário editar o campo, **então** a
   aplicação explicará o intervalo aceito e não exibirá um preço enganoso.

---

### História 3 — Corrigir entradas com facilidade (Prioridade P2)

Como usuário com pouco conhecimento financeiro, quero entender unidades e erros
dos campos para conseguir concluir o cálculo sem ajuda externa.

**Por que é P2**: reduz erros de precificação e abandono, mas depende do cálculo
principal.

**Teste independente**: tentar informar valores vazios, negativos, não numéricos
e fora dos limites e verificar mensagens, foco e ausência de resultados inválidos.

**Cenários de aceite**

1. **Dado** um campo monetário, **quando** ele for exibido, **então** seu rótulo
   e sua unidade deixarão claro o valor esperado.
2. **Dado** uma entrada negativa ou não numérica, **quando** o campo perder o
   foco ou for editado, **então** uma mensagem em linguagem simples será
   associada ao campo.
3. **Dado** que uma entrada necessária está inválida, **quando** os resultados
   forem atualizados, **então** nenhum resultado exibirá `NaN`, infinito ou valor
   monetário enganoso.

---

### História 4 — Retomar os últimos dados (Prioridade P3)

Como usuário recorrente no mesmo dispositivo, quero recuperar os valores
informados anteriormente para evitar redigitação.

**Por que é P3**: melhora conveniência, mas não é necessária para obter o primeiro
resultado.

**Teste independente**: preencher valores, recarregar a página e verificar sua
restauração; depois limpar os dados e verificar o estado inicial.

**Cenários de aceite**

1. **Dado** um conjunto válido de entradas salvo localmente, **quando** o usuário
   retornar no mesmo navegador, **então** os valores serão restaurados e os
   resultados recalculados.
2. **Dado** que o usuário deseja começar novamente, **quando** escolher limpar o
   cálculo, **então** os dados persistidos e os campos serão redefinidos após uma
   ação explícita.
3. **Dado** armazenamento ausente, indisponível ou corrompido, **quando** a
   aplicação iniciar, **então** a calculadora continuará utilizável com valores
   iniciais seguros.

---

### História 5 — Salvar e reabrir cálculos nomeados (Prioridade P2)

Como usuário recorrente, quero nomear cálculos importantes e acessá-los entre os
recentes para retomar orçamentos sem redigitar os dados.

**Por que é P2**: transforma a persistência automática em um histórico local
intencional, sem exigir conta, backend ou banco remoto.

**Teste independente**: salvar um cálculo válido com título, recarregar a página,
abri-lo na lista de recentes e conferir a restauração integral das entradas.

**Cenários de aceite**

1. **Dado** um cálculo válido e um título não vazio, **quando** o usuário salvar,
   **então** entradas, resultado e metadados serão armazenados no IndexedDB.
2. **Dado** que existem cálculos salvos, **quando** a aplicação carregar,
   **então** os cinco mais recentemente atualizados serão exibidos.
3. **Dado** um cálculo na lista de recentes, **quando** o usuário o selecionar,
   **então** suas entradas serão restauradas e a página retornará suavemente ao
   topo para tornar a mudança perceptível.
4. **Dado** um cálculo salvo, **quando** o usuário escolher excluí-lo, **então**
   somente esse registro será removido.
5. **Dado** IndexedDB indisponível, **quando** listar, salvar ou excluir falhar,
   **então** a calculadora continuará utilizável e apresentará feedback.
6. **Dado** o armazenamento local, **quando** a interface explicar a
   persistência, **então** informará que os dados existem somente naquele
   navegador.

## Casos de borda

- Peso ou tempo igual a zero deve resultar em custo zero para o componente
  correspondente, sem quebrar o cálculo.
- Valores decimais devem aceitar o formato de entrada definido para pt-BR sem
  perder precisão durante a edição.
- Margem deve estar no intervalo de 0% inclusive a 100% exclusive.
- Percentual de perdas deve estar entre 0% e 100%, inclusive.
- Valores muito grandes devem ser limitados ou validados para evitar estouro,
  infinito ou uma interface ilegível.
- Uma versão antiga ou inválida dos dados locais deve ser ignorada de forma
  segura.
- Título vazio ou composto apenas por espaços não pode ser salvo.
- A lista de recentes deve ser ordenada por `updatedAt` decrescente e limitada a
  cinco registros.
- Arredondamento visual não deve ser reutilizado em etapas intermediárias do
  cálculo.

## Requisitos funcionais

- **RF-001**: o sistema deve permitir informar o peso da peça em gramas.
- **RF-002**: o sistema deve permitir informar o preço do filamento por
  quilograma.
- **RF-003**: o sistema deve permitir informar o tempo de impressão.
- **RF-004**: o sistema deve permitir informar a potência considerada da
  impressora em watts.
- **RF-005**: o sistema deve permitir informar embalagem e outros custos como
  valores monetários por unidade produzida.
- **RF-006**: o sistema deve permitir informar percentual de perdas e margem de
  lucro desejada.
- **RF-007**: o sistema deve calcular custo de filamento, energia, perdas e custo
  total segundo as regras de negócio desta especificação.
- **RF-008**: o sistema deve calcular preço sugerido e lucro estimado.
- **RF-009**: o sistema deve recalcular os resultados imediatamente após uma
  alteração válida.
- **RF-010**: o sistema deve apresentar a composição do custo de forma legível,
  além do custo total.
- **RF-011**: o sistema deve validar entradas e apresentar mensagens específicas
  junto aos campos.
- **RF-012**: o sistema não deve usar entradas inválidas para apresentar
  resultados financeiros como se fossem válidos.
- **RF-013**: o sistema deve persistir e restaurar localmente a última entrada
  válida.
- **RF-014**: o sistema deve oferecer uma ação explícita para limpar o cálculo e
  os dados persistidos.
- **RF-015**: todas as funcionalidades essenciais devem ser utilizáveis em
  celular e desktop e por navegação via teclado.
- **RF-016**: o sistema deve apresentar um seletor com Distrito Federal e os 26
  estados brasileiros, identificados pelo nome e pela sigla.
- **RF-017**: ao selecionar uma UF, o sistema deve preencher o preço do kWh com
  uma estimativa correspondente àquela UF.
- **RF-018**: o preço estimado do kWh deve permanecer editável; um valor manual
  informado pelo usuário deve prevalecer sobre a estimativa.
- **RF-019**: o sistema deve distinguir visualmente valor estimado de valor
  informado pelo usuário.
- **RF-020**: junto ao preço estimado, o sistema deve informar fonte, competência
  dos dados, classe B1 residencial convencional e que o valor é aproximado.
- **RF-021**: caso não exista estimativa válida para a UF, o sistema deve
  solicitar o preço do kWh sem impedir os demais campos do cálculo.
- **RF-022**: após a seleção da UF, o sistema deve oferecer um seletor opcional
  contendo apenas distribuidoras associadas àquela UF e a opção “Não sei — usar
  média do estado”.
- **RF-023**: quando uma distribuidora for selecionada, sua estimativa deve
  prevalecer sobre a média estadual; quando não for, deve ser usada a média
  estadual.
- **RF-024**: o sistema deve permitir calcular mão de obra por tempo de trabalho
  multiplicado pelo valor da hora ou informar diretamente um valor por peça.
- **RF-025**: as estimativas automáticas de energia do MVP devem representar a
  classe B1 residencial na modalidade convencional.
- **RF-026**: o sistema deve oferecer um catálogo local opcional de modelos de
  impressora, começando por Bambu Lab A1 e A1 mini.
- **RF-027**: ao selecionar modelo e tensão de 127 V ou 220 V, o sistema deve
  preencher a potência máxima publicada pelo fabricante.
- **RF-028**: a potência preenchida pelo catálogo deve continuar editável e um
  valor manual deve prevalecer até uma nova seleção explícita de modelo ou
  tensão.
- **RF-029**: a interface deve identificar potência máxima como estimativa
  conservadora, diferenciá-la de consumo médio e apresentar a fonte oficial.
- **RF-030**: o sistema deve permitir salvar um cálculo válido com título.
- **RF-031**: cada cálculo nomeado deve persistir entradas, resultado, versão do
  formato e datas de criação e atualização no IndexedDB.
- **RF-032**: o sistema deve apresentar os cinco cálculos salvos atualizados mais
  recentemente.
- **RF-033**: selecionar um cálculo recente deve restaurar integralmente suas
  entradas e conduzir a página suavemente ao topo.
- **RF-034**: o sistema deve permitir excluir individualmente um cálculo salvo.
- **RF-035**: falhas do IndexedDB não devem impedir o cálculo principal.
- **RF-036**: a interface deve informar que os cálculos nomeados ficam somente
  no navegador atual.

## Regras de negócio e fórmulas

### Entradas normalizadas

- `pesoEmGramas`
- `precoFilamentoPorKg`
- `tempoEmHoras`
- `potenciaEmWatts`
- `modeloImpressoraId` (opcional)
- `tensaoImpressora` (`127` ou `220`, opcional)
- `origemPotencia` (`manufacturer-max` ou `manual`, opcional)
- `uf`
- `distribuidoraId` (opcional)
- `precoEnergiaPorKwh`
- `origemPrecoEnergia` (`state`, `distributor` ou `manual` no código; “média
  estadual”, “distribuidora” ou “informado manualmente” na interface)
- `custoEmbalagem`
- `modoMaoDeObra` (`calculado` ou `direto`)
- `tempoMaoDeObraEmHoras` (quando calculado)
- `valorHoraMaoDeObra` (quando calculado)
- `custoMaoDeObraDireto` (somente quando o modo for direto)
- `outrosCustos`
- `percentualPerdas`
- `margemPercentual`

### Cálculos

```text
custoFilamento =
  (pesoEmGramas / 1000) × precoFilamentoPorKg

custoEnergia =
  (potenciaEmWatts / 1000) × tempoEmHoras × precoEnergiaPorKwh

baseSujeitaAPerdas =
  custoFilamento + custoEnergia

custoPerdas =
  baseSujeitaAPerdas × (percentualPerdas / 100)

custoMaoDeObra =
  tempoMaoDeObraEmHoras × valorHoraMaoDeObra
  // ou valor direto por peça, conforme o modo selecionado

custoTotal =
  custoFilamento
  + custoEnergia
  + custoPerdas
  + custoEmbalagem
  + custoMaoDeObra
  + outrosCustos

precoSugerido =
  custoTotal / (1 - margemPercentual / 100)

lucro =
  precoSugerido - custoTotal
```

### Premissas adotadas

- “Margem” significa margem bruta sobre o preço de venda, e não acréscimo
  (markup) sobre o custo. Por isso, custo de R$ 80,00 com margem de 20% resulta
  em preço de R$ 100,00.
- Perdas representam repetição ou descarte da etapa de impressão e incidem sobre
  filamento e energia, não sobre embalagem, mão de obra ou outros custos.
- Mão de obra usa por padrão tempo de trabalho × valor por hora, com alternativa
  de valor direto por peça.
- Taxas de marketplace, impostos, depreciação e manutenção não fazem parte do
  MVP; podem futuramente entrar em “outros custos” até ganharem regras próprias.
- O valor por UF é uma estimativa para facilitar o preenchimento, não uma
  reprodução exata da conta individual. Distribuidora, classe tarifária, tributos,
  bandeira vigente e regras locais podem alterar o valor real.
- A estimativa automática usa B1 residencial convencional. Usuários comerciais
  ou enquadrados em outra classe devem informar manualmente o valor do próprio
  kWh; a edição manual sempre prevalece.
- Sempre que souber o valor efetivo, o usuário deve poder substituí-lo pelo preço
  médio do kWh obtido em sua própria conta de energia.

## Fonte e política dos dados de energia

### Fonte oficial

A fonte primária deve ser o Portal de Dados Abertos da ANEEL. Para aproximar o
valor efetivamente faturado, a série preferencial é a de mercado das
distribuidoras (SAMP), pois contém consumo e receita faturada com tributos e
adicional de bandeira. A tarifa média de um período é derivada por:

```text
tarifaMediaEfetiva = receitaFaturadaComTributos / consumoFaturadoEmKWh
```

Quando essa série não puder ser agregada com segurança por UF, a fonte secundária
é o conjunto de tarifas homologadas das distribuidoras, usando TUSD + TE para a
classe B1 residencial e modalidade convencional. Nesse caso, a interface deve avisar que
tributos, contribuição de iluminação pública e bandeira podem não estar
incluídos.

### Agregação por UF

- A tabela deve conter as 27 UFs.
- O usuário pode selecionar uma distribuidora após escolher a UF; esse valor tem
  precedência sobre a média estadual.
- Havendo múltiplas distribuidoras na mesma UF, a média estadual deve ser ponderada pelo
  consumo faturado, nunca uma média aritmética simples das tarifas.
- A competência deve usar a média móvel dos 12 meses oficiais completos mais
  recentes.
- A Contribuição de Iluminação Pública não deve ser embutida no custo do kWh,
  pois sua regra é municipal e pode não variar proporcionalmente ao consumo.
- O artefato gerado deve separar cadastros de distribuidoras das estimativas.
  Cada estimativa deve pertencer a um único par UF/distribuidora e guardar valor
  por kWh, competência, fonte, método e data de atualização.

### Estratégia do MVP

- Os valores serão publicados como um pequeno arquivo versionado junto à
  aplicação, sem chamada externa durante o uso da calculadora.
- A atualização da tabela será um processo de manutenção reproduzível e
  documentado, executado antes de novas versões da aplicação.
- Um gerador determinístico deve transformar entradas brutas identificadas em
  estimativas B1 convencionais por par UF/distribuidora e médias estaduais
  ponderadas, usando os 12 meses completos mais recentes.
- Se os dados estiverem desatualizados, a calculadora continuará funcional,
  exibindo a competência e permitindo correção manual.
- Integração automática com uma API poderá ser adicionada no futuro atrás do
  mesmo contrato de consulta, sem alterar as regras de cálculo.

## Entidades conceituais

### Entrada do cálculo

Conjunto dos valores informados pelo usuário, acompanhado de uma versão de
formato para permitir migração futura dos dados locais.

### Resultado do cálculo

Objeto derivado contendo cada componente de custo, custo total, lucro e preço
sugerido. No rascunho automático ele não é persistido; em um cálculo nomeado é
guardado como fotografia do momento, enquanto as entradas permanecem disponíveis
para restauração e novo cálculo.

## Requisitos não funcionais

- **RNF-001 — Usabilidade**: uma pessoa do público-alvo deve conseguir obter um
  primeiro resultado sem treinamento ou documentação externa.
- **RNF-002 — Feedback**: em condições normais no dispositivo, a atualização dos
  resultados deve ser percebida como imediata após a edição.
- **RNF-003 — Responsividade**: não deve existir rolagem horizontal na largura
  mínima suportada de 320 px.
- **RNF-004 — Acessibilidade**: campos, erros e resultados devem possuir nomes
  acessíveis, foco visível e não depender apenas de cor.
- **RNF-005 — Confiabilidade**: falhas no armazenamento local não devem impedir o
  uso da calculadora.
- **RNF-006 — Testabilidade**: 100% das fórmulas e limites de domínio devem ser
  exercitados por testes unitários, incluindo casos de borda definidos.
- **RNF-007 — Privacidade**: nenhum dado informado deve sair do navegador no MVP.
- **RNF-008 — Rastreabilidade**: todo valor sugerido de energia deve ser
  rastreável até a fonte, competência e método de agregação usados.
- **RNF-009 — Isolamento local**: cálculos nomeados não devem exigir rede, conta
  ou servidor e devem permanecer restritos à origem atual do navegador.

## Critérios mensuráveis de sucesso

- **CS-001**: pelo menos 90% dos participantes representativos conseguem obter
  custo total e preço sugerido em até 2 minutos, sem assistência. Este é um
  critério de validação pós-deploy e não bloqueia a primeira publicação técnica.
- **CS-002**: 100% dos cenários numéricos de referência aprovados retornam valores
  corretos antes do arredondamento de exibição.
- **CS-003**: alterações válidas refletem visualmente nos resultados em até
  100 ms em um dispositivo de referência definido no plano.
- **CS-004**: todas as operações essenciais são concluídas em telas a partir de
  320 px e apenas com teclado.
- **CS-005**: recarregar a página no mesmo navegador restaura 100% das entradas
  válidas do último cálculo.
- **CS-006**: salvar, listar, reabrir e excluir um cálculo nomeado funciona no
  mesmo navegador sem comunicação externa.

## Fora do escopo do MVP

- autenticação e contas;
- sincronização entre dispositivos;
- backend, API ou banco de dados remoto;
- cadastros de impressoras, materiais, filamentos, clientes ou produtos;
- estoque, pedidos, orçamentos, propostas e relatórios;
- sincronização ou compartilhamento do histórico local;
- taxas específicas de marketplaces e impostos fora dos que já estejam
  incorporados na estimativa oficial faturada de energia;
- dashboard e controle financeiro;
- telemetria ou compartilhamento de dados.

## Dependências

- Navegador moderno com JavaScript habilitado.
- Local Storage para restauração automática e IndexedDB para cálculos nomeados;
  o cálculo não pode depender da disponibilidade de nenhum dos dois.

## Decisões de esclarecimento

- Margem é margem bruta sobre o preço de venda.
- Perdas incidem sobre filamento e energia.
- Mão de obra usa tempo × valor/hora por padrão e aceita valor direto.
- Distribuidora é opcional; a média estadual é o fallback.
- Energia usa média móvel dos 12 meses oficiais completos mais recentes.
- A classe tarifária padrão é B1 residencial convencional; usuários comerciais
  usam o campo editável com o valor de sua conta.
