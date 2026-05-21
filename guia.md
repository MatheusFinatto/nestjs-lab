# Fase 1 — Guia de Construção

**Início:** 23/04/2026 | **Limite:** antes do projeto final (Webhook Ingestion)  
**Objetivo:** dominar os fundamentos que aparecem em toda vaga Senior Backend com NestJS.

---

## Estrutura de diretórios

Cada módulo é um projeto NestJS independente. Scaffold novo a cada módulo — você pratica o setup, não herda código que não escreveu.

```
fase-1/
  guia.md                        ← este arquivo
  modulo-1-crud/                 ← nest new aqui
  modulo-2-banco/                ← nest new aqui
  modulo-3-pipes-interceptors/   ← nest new aqui
  modulo-4-auth/                 ← nest new aqui
  modulo-5-testes/               ← nest new aqui
  modulo-6-docker/               ← nest new aqui
  modulo-7-filas/                ← nest new aqui
```

> Módulos 6 e 7 são aprendidos on-the-go — podem ser feitos em paralelo com o projeto final, usando o mesmo projeto como laboratório.

---

## Visão geral

A Fase 1 tem 7 módulos. Cada um constrói sobre o anterior. No fim você estará pronto para implementar o projeto portfólio (`projects/webhook-ingestion.md`), que usa tudo isso junto.

```
Módulo 1 → CRUD + REST + DTOs + Validação
Módulo 2 → Banco real (PostgreSQL + TypeORM)
Módulo 3 → Error handling, Pipes, Interceptors
Módulo 4 → Auth (JWT + Guards)
Módulo 5 → Testes (unit + e2e)
Módulo 6 → Docker + Config de ambiente
Módulo 7 → Filas (BullMQ + Redis) + Idempotência
              ↓
        Projeto Final: Webhook Ingestion
```

---

## Libs necessárias por módulo

### Módulo 1 — CRUD + Validação

| Pacote | Motivo |
|--------|--------|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | core NestJS |
| `class-validator` | decorators de validação nos DTOs (`@IsString`, `@IsInt`, etc.) |
| `class-transformer` | transforma plain object em instância de classe (necessário pro ValidationPipe funcionar) |

> **Por que não Zod?** NestJS usa sistema de DTOs baseado em classes com decorators. O `ValidationPipe` padrão do NestJS integra com `class-validator`/`class-transformer` nativamente — zero config. Zod funciona no NestJS mas exige um `ZodValidationPipe` customizado e perde a integração automática com Swagger. Para NestJS, `class-validator` é o padrão de mercado e o que aparece em 95% das codebases e entrevistas.

### Módulo 2 — Banco real

| Pacote | Motivo |
|--------|--------|
| `@nestjs/typeorm` | módulo de integração TypeORM com NestJS |
| `typeorm` | ORM em si: entities, migrations, repository pattern |
| `pg` | driver PostgreSQL para Node.js |

> **Escolha: TypeORM, não Prisma aqui.** TypeORM usa classes/decorators (mesmo padrão do NestJS). Prisma é excelente mas usa schema file separado — aprenda TypeORM primeiro para entender o padrão decorator que vaga senior cobra.

### Módulo 3 — Error handling, Pipes, Interceptors

Sem dependências novas. Tudo está em `@nestjs/common`.

### Módulo 4 — Auth JWT

| Pacote | Motivo |
|--------|--------|
| `@nestjs/jwt` | módulo NestJS para assinar/verificar JWT |
| `@nestjs/passport` | integração Passport com NestJS (Guards) |
| `passport` | middleware de auth para Node.js |
| `passport-jwt` | estratégia JWT para Passport |
| `bcrypt` | hash de senha (nunca armazenar senha em texto plano) |
| `@types/bcrypt` | tipagem TypeScript para bcrypt |
| `@types/passport-jwt` | tipagem TypeScript |

### Módulo 5 — Testes

| Pacote | Motivo |
|--------|--------|
| `jest` | já vem no scaffold NestJS |
| `@nestjs/testing` | `Test.createTestingModule()` para DI nos testes |
| `supertest` | requisições HTTP reais nos testes e2e |
| `@types/supertest` | tipagem |

### Módulo 6 — Docker + Config

| Pacote | Motivo |
|--------|--------|
| `@nestjs/config` | lê `.env`, disponibiliza via `ConfigService` com type safety |
| `dotenv` | já é dependência do `@nestjs/config` |

> Docker e Docker Compose não são pacotes npm — são ferramentas instaladas na máquina.

### Módulo 7 — Filas

| Pacote | Motivo |
|--------|--------|
| `bullmq` | implementação da fila (versão moderna, substitui `bull`) |
| `@nestjs/bullmq` | módulo NestJS para integrar BullMQ com DI |
| `ioredis` | cliente Redis para Node.js (BullMQ usa internamente) |

---

## Módulo 1 — CRUD + REST + DTOs + Validação

**Referência:** `tasks/task-01-crud/`

### Conceitos

- Anatomia de um módulo NestJS: `Module → Controller → Service`
- Injeção de dependência: `@Injectable()`, `@InjectRepository()`, providers array
- REST conventions: verbos corretos, rotas sem verbo na URL, status codes corretos
- DTOs: classes TypeScript com decorators de validação
- `ValidationPipe` global: transforma e valida body automaticamente

### Checklist

- [ ] Scaffold com `@nestjs/cli`: `nest new <projeto>`
- [ ] Criar `ProductsModule`, `ProductsController`, `ProductsService`
- [ ] Implementar todos os endpoints REST:
  - [ ] `GET /products` → 200 + array
  - [ ] `GET /products/:id` → 200 + objeto | 404
  - [ ] `POST /products` → 201 + objeto criado
  - [ ] `PUT /products/:id` → 200 + objeto atualizado | 404
  - [ ] `DELETE /products/:id` → 204 sem body | 404
- [ ] `CreateProductDto` com validações:
  - [ ] `name: string` — `@IsString()`, `@IsNotEmpty()`
  - [ ] `price: number` — `@IsNumber()`, `@IsPositive()`
  - [ ] `stock: number` — `@IsInt()`, `@Min(0)`
- [ ] `UpdateProductDto` — mesmas validações, todos os campos obrigatórios (PUT = substituição total)
- [ ] `ValidationPipe` global em `main.ts` com `{ whitelist: true, forbidNonWhitelisted: true }`
- [ ] `NotFoundException` no service quando produto não encontrado
- [ ] Testar manualmente com curl ou Insomnia/Postman:
  - [ ] POST com body válido → 201
  - [ ] POST com body inválido → 400 com mensagem de erro
  - [ ] GET inexistente → 404
  - [ ] DELETE → 204

---

## Módulo 2 — Banco Real (PostgreSQL + TypeORM)

### Conceitos

- Entity: classe TypeScript que mapeia pra tabela (`@Entity()`, `@Column()`, `@PrimaryGeneratedColumn()`)
- Repository: abstração de acesso ao banco (`this.repo.find()`, `this.repo.save()`, etc.)
- Migrations: arquivos que descrevem mudanças de schema — nunca sincronizar automaticamente em produção
- `synchronize: true` vs migrations: diferença crítica (sync destrói dados em prod)
- Transactions: garantir atomicidade quando múltiplas operações dependem uma da outra

### Checklist

- [ ] Subir PostgreSQL local (Docker: `docker run -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres`)
- [ ] Instalar `@nestjs/typeorm typeorm pg`
- [ ] Configurar `TypeOrmModule.forRoot()` no `AppModule`
- [ ] Criar entity `Product` com decorators TypeORM:
  - [ ] `@PrimaryGeneratedColumn()` para id
  - [ ] `@Column()` para name, price, stock
  - [ ] `@CreateDateColumn()` para createdAt
- [ ] Trocar array em memória por `Repository<Product>` injetado via `@InjectRepository()`
- [ ] Trocar todos os métodos do service para usar o repository:
  - [ ] `findAll()` → `repo.find()`
  - [ ] `findOne()` → `repo.findOneBy({ id })` + NotFoundException
  - [ ] `create()` → `repo.create()` + `repo.save()`
  - [ ] `update()` → `repo.findOneBy()` + `Object.assign()` + `repo.save()`
  - [ ] `remove()` → `repo.findOneBy()` + `repo.remove()`
- [ ] Gerar e rodar primeira migration (não usar `synchronize: true`)
- [ ] Confirmar que dados persistem após reiniciar a aplicação

---

## Módulo 3 — Error Handling, Pipes, Interceptors

### Conceitos

- Exception filters: captura exceções e formata a resposta (global, por controller, por handler)
- Pipes: transforma ou valida dados antes de chegar no handler
- Interceptors: envolve a execução (antes + depois) — logging, transform response, timeout
- Ordem de execução no pipeline NestJS: `Middleware → Guard → Interceptor (antes) → Pipe → Handler → Interceptor (depois) → Exception Filter`

### Checklist

- [ ] Criar `HttpExceptionFilter` global que padroniza todas as respostas de erro:
  ```json
  { "statusCode": 404, "message": "Product not found", "timestamp": "..." }
  ```
- [ ] Registrar o filter globalmente em `main.ts` via `app.useGlobalFilters()`
- [ ] Criar `ParseIntPipe` customizado (ou usar o built-in) para validar `:id` como número inteiro
- [ ] Criar `LoggingInterceptor` que loga: método, rota, status, tempo de resposta
- [ ] Criar `TransformInterceptor` que envolve toda resposta em `{ data: <resultado> }`
- [ ] Registrar interceptors globalmente
- [ ] Entender a diferença entre `@UsePipes()`, `@UseInterceptors()`, `@UseFilters()` por escopo (global / controller / handler)

---

## Módulo 4 — Auth (JWT + Guards)

### Conceitos

- Autenticação vs. autorização: quem você é vs. o que você pode fazer
- JWT: header.payload.signature — stateless, o servidor não guarda sessão
- Guard: decide se a requisição pode prosseguir (retorna boolean)
- `@Public()` decorator customizado: marcar rotas que não precisam de auth
- Refresh token: conceito (não precisa implementar agora, mas entender por que existe)
- Nunca guardar JWT no localStorage em prod (XSS) — mas isso é frontend, contexto útil

### Checklist

- [ ] Criar `UsersModule` com `User` entity (id, email, passwordHash, createdAt)
- [ ] `POST /auth/register` → recebe email + password, salva com bcrypt hash
- [ ] `POST /auth/login` → valida email + password, retorna JWT
  - [ ] `bcrypt.compare()` para verificar senha
  - [ ] `JwtService.sign({ sub: user.id, email: user.email })`
  - [ ] Expiração do token: `expiresIn: '7d'`
- [ ] Criar `JwtStrategy` (Passport): extrai token do header `Authorization: Bearer <token>`, valida, retorna payload
- [ ] Criar `JwtAuthGuard` que usa a strategy
- [ ] Registrar `JwtAuthGuard` globalmente (protege tudo por padrão)
- [ ] Criar decorator `@Public()` para marcar rotas públicas (login, register)
- [ ] Criar decorator `@CurrentUser()` para extrair o user autenticado do request
- [ ] Proteger os endpoints de products com auth:
  - [ ] GET pode ser público
  - [ ] POST, PUT, DELETE exigem JWT válido
- [ ] Testar fluxo completo:
  - [ ] Register → Login → usar token no Bearer → acessar rota protegida
  - [ ] Token inválido → 401
  - [ ] Sem token → 401

---

## Módulo 5 — Testes

### Conceitos

- Unit test: testa uma unidade isolada (service) com dependências mockadas
- e2e test: sobe a aplicação real e faz requisições HTTP — testa o fluxo completo
- `Test.createTestingModule()`: cria módulo NestJS para testes com DI
- Mock de repository: `{ find: jest.fn(), save: jest.fn(), ... }`
- Coverage: métrica de linhas cobertas — 100% não garante qualidade, mas < 60% é sinal ruim

### Checklist

**Unit tests (ProductsService):**
- [ ] Setup: `Test.createTestingModule()` com repository mockado
- [ ] `findAll()` → retorna array do mock
- [ ] `findOne(id)` existente → retorna produto
- [ ] `findOne(id)` inexistente → lança `NotFoundException`
- [ ] `create(dto)` → chama `repo.save()` com dados corretos
- [ ] `update(id, dto)` existente → retorna produto atualizado
- [ ] `update(id, dto)` inexistente → lança `NotFoundException`
- [ ] `remove(id)` existente → chama `repo.remove()`
- [ ] `remove(id)` inexistente → lança `NotFoundException`

**e2e tests (ProductsController):**
- [ ] Setup: `Test.createTestingModule()` com banco real de teste (banco separado, não o de dev)
- [ ] Limpar tabelas antes de cada teste (`beforeEach`)
- [ ] `GET /products` → 200 + array vazio inicialmente
- [ ] `POST /products` com body válido → 201 + produto criado
- [ ] `POST /products` com body inválido → 400
- [ ] `GET /products/:id` existente → 200
- [ ] `GET /products/:id` inexistente → 404
- [ ] `PUT /products/:id` → 200 com dados atualizados
- [ ] `DELETE /products/:id` → 204, depois GET retorna 404

---

## Módulo 6 — Docker + Config de Ambiente

### Conceitos

- `.env` file: variáveis de ambiente locais, nunca commitadas
- `@nestjs/config` + `ConfigService`: acessa vars de ambiente com type safety, sem `process.env` espalhado
- Docker: empacotar a aplicação em container
- Docker Compose: orquestrar múltiplos containers (api + postgres + redis)
- Multi-stage build: imagem menor em produção (não carrega devDependencies)

### Checklist

**Config:**
- [ ] Criar `.env` com variáveis: `DATABASE_URL`, `JWT_SECRET`, `PORT`
- [ ] Adicionar `.env` no `.gitignore`
- [ ] Criar `.env.example` com as mesmas chaves mas sem valores reais
- [ ] Instalar `@nestjs/config` e configurar `ConfigModule.forRoot({ isGlobal: true })`
- [ ] Substituir todos os `process.env.X` por `ConfigService.get<string>('X')`
- [ ] Criar `configuration.ts` que exporta objeto tipado com todas as vars (elimina magic strings)

**Docker:**
- [ ] Criar `Dockerfile` multi-stage:
  - Stage `builder`: instala deps + compila TypeScript
  - Stage `runner`: copia apenas `dist/` e `node_modules` de prod
- [ ] Criar `docker-compose.yml` com serviços:
  - [ ] `postgres`: image `postgres:16`, volume para persistência, healthcheck
  - [ ] `redis`: image `redis:7-alpine`, healthcheck
  - [ ] `api`: build do Dockerfile, depende de postgres + redis, env vars injetadas
- [ ] `docker-compose up` sobe tudo e aplicação funciona
- [ ] Migrations rodam automaticamente na inicialização (não sync)

---

## Módulo 7 — Filas (BullMQ + Redis) + Idempotência

### Conceitos

- Fila: desacopla produtor de consumidor — produtor enfileira, worker processa em background
- Job: unidade de trabalho na fila (tem payload, tentativas, delay)
- Worker (Processor): consome jobs da fila e os processa
- Retry exponencial: falha → espera 2s → retry → espera 4s → retry → espera 8s → DLQ
- Dead-letter queue (DLQ): destino de jobs que falharam todas as tentativas
- Idempotência: processar o mesmo job N vezes tem o mesmo efeito que processar 1 vez
- At-least-once delivery: fila garante entrega, mas pode entregar mais de uma vez → idempotência é sua responsabilidade

### Checklist

- [ ] Instalar `bullmq @nestjs/bullmq`
- [ ] Configurar `BullModule.forRoot()` com conexão Redis no `AppModule`
- [ ] Criar `OrdersModule` com fila `orders-queue`
- [ ] Producer: `POST /orders` → enfileira job com payload do pedido, retorna 202 Accepted imediatamente
- [ ] Processor (`@Processor('orders-queue')`): consome jobs, processa pedido, salva no banco
- [ ] Retry: configurar `attempts: 3` com backoff exponencial (`backoff: { type: 'exponential', delay: 2000 }`)
- [ ] DLQ: capturar evento `failed` do worker, mover job para tabela `failed_jobs` no banco com razão do erro
- [ ] Idempotência: campo `externalId` único na tabela orders — se job duplicado chegar, `INSERT ... ON CONFLICT DO NOTHING`
- [ ] `GET /orders/:id` → retorna status do pedido (pending/processing/done/failed)
- [ ] Testar fluxo completo:
  - [ ] POST → 202 imediato
  - [ ] Consultar status → pending → processing → done
  - [ ] Simular falha no processor → ver retries → ver DLQ

---

## Ordem de execução sugerida

```
[ ] Módulo 1 — CRUD (task-01 já existe, completar)
[ ] Módulo 2 — Banco real (evoluir o mesmo projeto do módulo 1)
[ ] Módulo 3 — Error handling (adicionar ao projeto em andamento)
[ ] Módulo 4 — Auth (adicionar ao projeto em andamento)
[ ] Módulo 5 — Testes (cobrir o que foi construído)
[ ] Módulo 6 — Docker (dockerizar o projeto)
[ ] Módulo 7 — Filas (novo módulo no projeto ou projeto separado)
              ↓
[ ] Projeto Final: Webhook Ingestion (tudo junto)
```

---

## Red flags para não levar pra entrevista

- `synchronize: true` em qualquer ambiente (destrói dados, nunca em prod)
- Senha em texto plano no banco
- JWT secret hardcoded no código
- `process.env.X` espalhado pelo código sem ConfigService
- `any` no TypeScript onde o tipo é conhecido
- Service acessando banco diretamente sem Repository (SQL raw sem abstração)
- Rotas com verbos na URL (`GET /getProduct/:id`)
- Retornar 200 onde deveria ser 201, 204 ou 404
