# Módulo 8 — Banco Avançado: Transações, Paginação, Índices

## Objetivo

Fechar os três buracos que separam "fiz CRUD" de "sei mexer com banco de verdade":
atomicidade (transações), leitura escalável (paginação) e performance (índices).
São os temas que um entrevistador sênior usa pra descobrir se você só fez tutorial
ou já operou banco sob carga.

**Fazer antes do worker do projeto final** — o worker (cria order + marca evento
processado) é exatamente onde transação deixa de ser teoria.

## Domínio

Continua no projeto do lab (products). Adicionar um relacionamento que force
escrita em duas tabelas — ex: `Order` + `OrderItem`, ou `product` + um log de
movimentação de estoque. Sem duas escritas, transação não tem o que ensinar.

---

## Parte 1 — Transações

### Problema que resolve

```ts
// SEM transação — bug latente
await this.ordersRepo.save(order);          // ✅ grava
await this.stockRepo.decrement(productId);  // 💥 se isso falhar aqui...
// ...a order ficou gravada com estoque NÃO decrementado. Dado corrompido.
```

Duas escritas que precisam acontecer **juntas ou nenhuma**. Transação garante
atomicidade: ou as duas comitam, ou faz rollback de tudo.

### Como fazer no TypeORM

Forma recomendada — `DataSource.transaction()`:

```ts
await this.dataSource.transaction(async (manager) => {
  const order = await manager.save(Order, dto);
  await manager.decrement(Product, { id: dto.productId }, 'stock', dto.qty);
  return order;
  // throw aqui dentro → rollback automático de TUDO
});
```

Forma manual (`QueryRunner`) — saber que existe, usar quando precisa de controle fino:

```ts
const qr = this.dataSource.createQueryRunner();
await qr.connect();
await qr.startTransaction();
try {
  await qr.manager.save(...);
  await qr.manager.update(...);
  await qr.commitTransaction();
} catch (err) {
  await qr.rollbackTransaction();
  throw err;
} finally {
  await qr.release(); // SEMPRE — senão vaza conexão do pool
}
```

### Conceitos que serão avaliados

- **Por que não dá pra simular transação na mão** (try/catch + "desfazer manualmente"
  não é atômico — entre o erro e o desfazer, outra request lê estado inconsistente).
- **Isolation levels** (READ COMMITTED default no Postgres, REPEATABLE READ, SERIALIZABLE)
  — o que cada um previne (dirty read, non-repeatable read, phantom). Cai em entrevista.
- **Por que `QueryRunner` precisa de `release()`** no finally (conexão volta pro pool).
- **Transação ≠ lock**: transação agrupa, lock (`SELECT ... FOR UPDATE`) serializa acesso
  concorrente à mesma linha. Saber a diferença.

---

## Parte 2 — Paginação

### Problema que resolve

`GET /products` devolvendo a tabela inteira é tell de júnior. 10k linhas = payload
gigante, query lenta, cliente travado. Produção sempre pagina.

### Duas estratégias — saber as duas e o trade-off

**Offset (LIMIT/OFFSET)** — simples, permite "pular pra página 50":

```ts
const [data, total] = await this.repo.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
  order: { createdAt: 'DESC' },
});
return { data, total, page, lastPage: Math.ceil(total / limit) };
```

Problema: `OFFSET 100000` faz o Postgres varrer e descartar 100k linhas. Degrada
linearmente. E se uma linha for inserida entre páginas, itens repetem/somem.

**Cursor / keyset** — escala constante, sem pulo de página:

```ts
// ?cursor=<createdAt do último item da página anterior>
const data = await this.repo.find({
  where: cursor ? { createdAt: LessThan(cursor) } : {},
  take: limit,
  order: { createdAt: 'DESC' },
});
const nextCursor = data.at(-1)?.createdAt ?? null;
return { data, nextCursor };
```

Performance constante (usa índice, não varre offset). Custo: não dá pra pular pra
página arbitrária — só "próxima". É o que feed infinito usa (Twitter, etc).

### Conceitos que serão avaliados

- **Quando offset, quando cursor**: admin com "ir pra página N" → offset. Feed/lista
  grande/tempo real → cursor.
- **Por que offset degrada** (varre + descarta) e cursor não (seek via índice).
- **Inconsistência do offset** sob escrita concorrente (item pula/repete entre páginas).
- **Cap no `limit`** — nunca confiar no cliente; `Math.min(limit, 100)` ou o cliente
  pede `?limit=999999` e derruba o banco.

---

## Parte 3 — Índices

### Problema que resolve

Coluna sem índice em `WHERE`/`ORDER BY` = full table scan. Em 100 linhas ninguém
percebe; em 10M a query trava.

```ts
@Entity()
@Index(['createdAt'])          // cursor pagination ordena por isso → precisa de índice
export class Product {
  @Column({ unique: true })    // unique JÁ cria índice
  sku: string;
}
```

### Conceitos que serão avaliados

- **`EXPLAIN ANALYZE`** — ler o query plan, distinguir `Seq Scan` (ruim em tabela
  grande) de `Index Scan`. Saber rodar isso é diferencial.
- **Índice não é grátis**: acelera leitura, **desacelera** escrita (todo INSERT/UPDATE
  atualiza o índice) e ocupa disco. Não indexar tudo — indexar o que filtra/ordena.
- **Índice composto e ordem das colunas** (`@Index(['status', 'createdAt'])` serve
  query que filtra por status e ordena por data; a ordem importa).
- **`UNIQUE` constraint cria índice** automaticamente (por isso `findByEmail` já é rápido).

---

## Libs necessárias

Nenhuma nova — tudo é TypeORM + Postgres que você já tem.

## Checklist de entrega

**Transações:**

- [ ] Um caso de duas escritas envolto em `dataSource.transaction()`
- [ ] Provar o rollback: forçar erro na segunda escrita, confirmar que a primeira não persistiu
- [ ] Explicar por escrito a diferença entre READ COMMITTED e SERIALIZABLE

**Paginação:**

- [ ] `GET /products` paginado com offset (`page`, `limit`, retorna `total`/`lastPage`)
- [ ] `limit` com cap máximo (cliente não escolhe payload ilimitado)
- [ ] Uma rota com cursor pagination (`?cursor=`, retorna `nextCursor`)
- [ ] Explicar por escrito quando usar offset vs cursor

**Índices:**

- [ ] `@Index` na coluna usada pela cursor pagination
- [ ] Rodar `EXPLAIN ANALYZE` numa query antes e depois do índice, comparar o plano
- [ ] Explicar o trade-off leitura vs escrita do índice
