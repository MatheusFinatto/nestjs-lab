# nestjs-lab

Study repository for NestJS backend fundamentals. Each module is an isolated NestJS project covering a specific topic, progressing from basics to production-ready patterns.

## Modules

| Module | Topic | Key concepts |
|--------|-------|--------------|
| [`modulo-1-crud`](./modulo-1-crud/) | REST CRUD + Validation | Controllers, Services, DTOs, `class-validator`, `ValidationPipe` |
| [`modulo-2-banco`](./modulo-2-banco/) | PostgreSQL + TypeORM | Entities, Repository pattern, Migrations |
| [`modulo-3-pipes-interceptors`](./modulo-3-pipes-interceptors/) | NestJS Pipeline | Exception filters, Pipes, Interceptors, request lifecycle |
| [`modulo-4-auth`](./modulo-4-auth/) | JWT Authentication | Passport, Guards, bcrypt, protected routes |
| [`modulo-5-testes`](./modulo-5-testes/) | Testing | Unit tests (Jest), e2e tests (Supertest), `@nestjs/testing` |
| [`modulo-6-docker`](./modulo-6-docker/) | Docker + Config | Multi-stage Dockerfile, Docker Compose, `@nestjs/config` |
| [`modulo-7-filas`](./modulo-7-filas/) | Async Queues | BullMQ, Redis, workers, exponential retry, dead-letter queue |

## Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL + TypeORM
- **Queue:** BullMQ + Redis
- **Auth:** JWT + Passport
- **Testing:** Jest + Supertest
- **Infra:** Docker + Docker Compose

## Goal

Hands-on progression toward production NestJS patterns. Each module is self-contained — scaffold, implement, move on.
