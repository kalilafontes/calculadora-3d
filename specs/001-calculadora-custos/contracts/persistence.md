# Contrato de persistência local

## Rascunho automático — Local Storage

### Chave

`calculadora3d:draft:v1`

### Operações

```ts
interface CalculationDraftRepository {
  load(): Promise<CalculationDraft | null>;
  save(draft: CalculationDraft): Promise<void>;
  clear(): Promise<void>;
}
```

### Comportamento

- `load` retorna `null` se a chave não existe, o JSON é inválido, o esquema não
  corresponde ou o armazenamento está indisponível.
- `save` substitui somente a chave desta aplicação e nunca persiste resultados
  derivados.
- `clear` remove somente a chave desta aplicação.
- Erros do mecanismo são tratáveis pela feature e não impedem cálculos.
- Nenhum dado é enviado para fora do navegador.

## Cálculos nomeados — IndexedDB

### Banco e object store

- banco: `calculadora3d`;
- versão do banco: `1`;
- object store: `saved-calculations`;
- chave primária: `id`;
- índice: `updatedAt`.

### Operações

```ts
interface SavedCalculationRepository {
  listRecent(limit?: number): Promise<SavedCalculation[]>;
  save(calculation: SavedCalculation): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Comportamento

- `listRecent` ordena por `updatedAt` decrescente e retorna no máximo o limite
  solicitado; a interface usa cinco;
- `save` cria ou substitui um registro pelo `id`;
- `delete` remove apenas o registro informado;
- erros são tratados pela feature, com feedback, sem bloquear a calculadora;
- os registros pertencem somente à origem atual e não são sincronizados;
- limpar dados do site pode apagar todos os registros.
