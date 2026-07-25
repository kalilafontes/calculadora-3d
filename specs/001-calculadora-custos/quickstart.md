# Guia de validação do MVP

Este documento define como verificar a implementação quando ela existir.

## Verificações automatizadas esperadas

```bash
npm run typecheck
npm test
npm run build
```

## Cenário numérico principal

Use:

- peso: 100 g;
- peças nesta impressão: 1;
- filamento: R$ 100/kg;
- impressão: 2 h;
- potência: 200 W;
- energia: R$ 1/kWh;
- embalagem: R$ 5;
- mão de obra direta: R$ 10;
- outros: R$ 4,60;
- perdas: 10%;
- margem: 20%.

Resultados esperados:

```text
filamento = 10,00
energia = 0,40
perdas = 1,04
mão de obra = 10,00
custo total = 31,04
preço sugerido = 38,80
lucro = 7,76
```

## Validação das histórias

### História 1

- Alterar peso atualiza filamento, perdas, total, preço e lucro.
- Alterar UF aplica média estadual.
- Selecionar distribuidora aplica sua estimativa.
- Escolher “Não sei” retorna à média estadual.
- Editar kWh marca o valor como manual.
- Fonte e período ficam visíveis para estimativas.

### História 2

- Custo de R$ 80 com margem de 20% produz preço R$ 100 e lucro R$ 20.
- Margem 0% produz lucro zero.
- Margem 100% é rejeitada.

### História 3

- Campos aceitam decimal pt-BR conforme regra definida.
- Negativos, vazios necessários e não numéricos exibem erro associado.
- A interface nunca mostra `NaN` ou infinito.
- Todo o fluxo funciona apenas por teclado.
- Não existe rolagem horizontal em 320 px.

### História 4

- Um cálculo válido reaparece após recarregar.
- JSON corrompido não quebra a aplicação.
- Limpar redefine o formulário e remove apenas a chave do produto.

### História 5

- Salvar exige cálculo válido e título não vazio.
- Após salvar, o item aparece entre os recentes com título e data.
- Recarregar mantém o item salvo no mesmo navegador.
- Abrir restaura todas as entradas e rola suavemente até o topo.
- Apenas os cinco itens mais recentemente atualizados são exibidos.
- Excluir remove somente o item escolhido.
- A interface informa “Somente neste navegador”.
- Indisponibilidade do IndexedDB não impede editar ou calcular.

### História 6

- Um cálculo válido oferece a ação “Gerar orçamento em PDF”.
- Vendedor, cliente e descrição obrigatórios apresentam validação.
- A quantidade usa corretamente o preço da impressão e as peças por mesa.
- O PDF possui uma página A4, cabeçalho, datas, cliente, item, total e condições.
- Custos internos, lucro e margem não aparecem no documento.
- Perfil do vendedor reaparece no próximo orçamento.
- Logo acima de 2 MB é rejeitado.
- Pix selecionado exige chave Pix.
- Entrada de 50% apresenta metade do total na aprovação e metade na entrega.
- Prazo diferencia dias úteis de dias corridos.
- Cuidados padrão aparecem somente quando selecionados.
- Cliente, observações e logotipo não são persistidos nem enviados.

### Cenário de impressão com várias peças

Use uma impressão sugerida a R$ 72,00, com 8 peças por mesa, e solicite 20
peças:

- o equivalente unitário deve ser R$ 9,00;
- o orçamento de 20 peças deve apresentar valor unitário de R$ 9,00 e total de
  R$ 180,00;
- uma imagem PNG ou JPEG opcional deve aparecer junto ao item do PDF;
- alterar a quantidade de peças por impressão não deve mudar o custo nem o preço
  da impressão completa.

## Validação do catálogo

- Executar o gerador duas vezes com as mesmas entradas e confirmar saída idêntica.
- Conferir URLs, competências, datas de coleta e hashes no manifesto bruto.
- Verificar 27 UFs.
- Verificar relação entre UF e distribuidoras.
- Verificar unicidade de cada par UF/distribuidora e confirmar que uma mesma
  distribuidora pode ter estimativas diferentes em UFs distintas.
- Conferir unidade R$/kWh.
- Conferir fonte e janela de 12 meses.
- Conferir classe B1 residencial e modalidade convencional.
- Comparar manualmente uma amostra de pelo menos três distribuidoras com a fonte.
- Confirmar que editar o kWh substitui a estimativa para um usuário comercial.

## Condição de aceite

A entrega pode avançar quando typecheck, testes e build passarem, os cinco
cenários de história forem demonstráveis e não houver violação da constituição.

CS-001 é verificado após a primeira publicação conforme
`checklists/usability-study.md`; seu resultado orienta correções de usabilidade,
mas não bloqueia o primeiro deploy técnico.
