# Fase 1 — Guia

**Início:** 23/04/2026 | **Limite:** antes do projeto final (Webhook Ingestion)

Projeto único na raiz — cada módulo incrementa o anterior. Specs em `specs/`.

## Módulos

| # | Tópico | Spec |
|---|--------|------|
| 1 | CRUD + REST + DTOs + Validação | [modulo-1-crud.md](./specs/modulo-1-crud.md) |
| 2 | PostgreSQL + TypeORM | [modulo-2-banco.md](./specs/modulo-2-banco.md) |
| 3 | Error handling, Pipes, Interceptors | [modulo-3-pipes-interceptors.md](./specs/modulo-3-pipes-interceptors.md) |
| 4 | JWT + Guards | [modulo-4-auth.md](./specs/modulo-4-auth.md) |
| 5 | Unit + e2e | [modulo-5-testes.md](./specs/modulo-5-testes.md) |
| 6 | Docker + Config | [modulo-6-docker.md](./specs/modulo-6-docker.md) |
| 7 | BullMQ + Redis + Idempotência | [modulo-7-filas.md](./specs/modulo-7-filas.md) |

## Libs por módulo

| Módulo | Instalar |
|--------|----------|
| 1 | `npm i class-validator class-transformer` |
| 2 | `npm i @nestjs/typeorm typeorm pg @nestjs/config` |
| 3 | — (tudo em `@nestjs/common`) |
| 4 | `npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt` + `npm i -D @types/passport-jwt @types/bcrypt` |
| 5 | `npm i -D supertest @types/supertest` |
| 6 | — |
| 7 | `npm i bullmq @nestjs/bullmq` |

## Red flags (não levar pra entrevista)

- `synchronize: true` no TypeORM (destrói dados em prod)
- Senha em texto plano no banco
- `JWT_SECRET` hardcoded no código
- `process.env.X` espalhado sem `ConfigService`
- `any` onde o tipo é conhecido
- Verbos na URL (`GET /getProducts`)
- 200 onde deveria ser 201, 204 ou 404
