# Fase 1 — Guia

**Início:** 23/04/2026 | **Limite:** antes do projeto final (Webhook Ingestion)

Cada módulo é um projeto NestJS independente em sua própria pasta. Spec detalhada em cada `spec.md`.

## Módulos

| # | Pasta | Tópico | Spec |
|---|-------|--------|------|
| 1 | `Modulos/modulo-1-crud/` | CRUD + REST + DTOs + Validação | [spec.md](./Modulos/modulo-1-crud/spec.md) |
| 2 | `Modulos/modulo-2-banco/` | PostgreSQL + TypeORM | [spec.md](./Modulos/modulo-2-banco/spec.md) |
| 3 | `Modulos/modulo-3-pipes-interceptors/` | Error handling, Pipes, Interceptors | [spec.md](./Modulos/modulo-3-pipes-interceptors/spec.md) |
| 4 | `Modulos/modulo-4-auth/` | JWT + Guards | [spec.md](./Modulos/modulo-4-auth/spec.md) |
| 5 | `Modulos/modulo-5-testes/` | Unit + e2e | [spec.md](./Modulos/modulo-5-testes/spec.md) |
| 6 | `Modulos/modulo-6-docker/` | Docker + Config | [spec.md](./Modulos/modulo-6-docker/spec.md) |
| 7 | `Modulos/modulo-7-filas/` | BullMQ + Redis + Idempotência | [spec.md](./Modulos/modulo-7-filas/spec.md) |

## Libs por módulo

| Módulo | Instalar |
|--------|----------|
| 1 | `npm i class-validator class-transformer` |
| 2 | `npm i @nestjs/typeorm typeorm pg` |
| 3 | — (tudo em `@nestjs/common`) |
| 4 | `npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt` + `npm i -D @types/passport-jwt @types/bcrypt` |
| 5 | `npm i -D supertest @types/supertest` |
| 6 | `npm i @nestjs/config` |
| 7 | `npm i bullmq @nestjs/bullmq` |

## Red flags (não levar pra entrevista)

- `synchronize: true` no TypeORM (destrói dados em prod)
- Senha em texto plano no banco
- `JWT_SECRET` hardcoded no código
- `process.env.X` espalhado sem `ConfigService`
- `any` onde o tipo é conhecido
- Verbos na URL (`GET /getProducts`)
- 200 onde deveria ser 201, 204 ou 404
