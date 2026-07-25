# Contrato de persistência local

## Chave

`calculadora3d:draft:v1`

## Operações

```ts
interface CalculationDraftRepository {
  load(): Promise<CalculationDraft | null>;
  save(draft: CalculationDraft): Promise<void>;
  clear(): Promise<void>;
}
```

## Comportamento

- `load` retorna `null` se a chave não existe, o JSON é inválido, o esquema não
  corresponde ou o armazenamento está indisponível.
- `save` substitui somente a chave desta aplicação e nunca persiste resultados
  derivados.
- `clear` remove somente a chave desta aplicação.
- Erros do mecanismo são tratáveis pela feature e não impedem cálculos.
- Nenhum dado é enviado para fora do navegador.
