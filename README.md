# nestjs-lab

Projeto incremental de estudo de NestJS. Cada módulo da [guia](./guia.md) adiciona uma camada à mesma API (`/products`).

**Estado atual:** Módulo 2 concluído — CRUD com PostgreSQL + TypeORM + migrations.

## Stack

- NestJS 11
- PostgreSQL 17 (via Docker)
- TypeORM 1 (Repository pattern + migrations)
- class-validator + class-transformer
- @nestjs/config

## Setup

### 1. Dependências

```bash
pnpm install
```

### 2. PostgreSQL via Docker

```bash
docker run --name nestjs-pg \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=nestjs_lab \
  -p 5544:5432 \
  -d postgres
```

### 3. Variáveis de ambiente

Cria `.env` na raiz:

```env
DB_HOST=localhost
DB_PORT=5544
DB_USERNAME=postgres
DB_PASSWORD=pass
DB_NAME=nestjs_lab
```

### 4. Migrations

```bash
pnpm migration:run
```

### 5. Rodar

```bash
pnpm start:dev
```

Servidor em `http://localhost:3210`.

## Endpoints

| Método | Rota            | Status ok | Status erro |
| ------ | --------------- | --------- | ----------- |
| GET    | `/products`     | 200       | —           |
| GET    | `/products/:id` | 200       | 404         |
| POST   | `/products`     | 201       | 400         |
| PUT    | `/products/:id` | 200       | 400, 404    |
| DELETE | `/products/:id` | 204       | 404         |

Body esperado em POST/PUT:

```json
{ "name": "string", "price": 9.99, "stock": 1 }
```

## Migrations

```bash
# gerar migration a partir de mudanças na entity
pnpm migration:generate src/migrations/NomeDaMigration

# aplicar migrations pendentes
pnpm migration:run

# reverter última migration aplicada
pnpm migration:revert
```

**Nunca** usar `synchronize: true` — schema sem histórico, sem reversão, pode dropar coluna com dados em produção.

## Scripts úteis

```bash
pnpm start:dev    # watch mode
pnpm build        # compila pra dist/
pnpm lint         # eslint --fix
pnpm test         # jest unit
pnpm test:e2e     # jest e2e
```
