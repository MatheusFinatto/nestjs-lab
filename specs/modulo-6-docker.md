# Módulo 6 — Docker + Config de Ambiente

## Objetivo

Dockerizar a aplicação e eliminar variáveis de ambiente hardcoded. `docker-compose up` deve subir tudo — banco, redis e API — sem configuração manual.

## Duas partes independentes

### Parte 1 — Config (`@nestjs/config`)

Problema que resolve: `process.env.X` espalhado pelo código é difícil de auditar, sem type safety, sem validação na inicialização.

Solução: `ConfigModule` centraliza o acesso. `ConfigService` injeta onde precisar. `configuration.ts` tipado elimina magic strings.

```ts
// configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
```

Uso no módulo:
```ts
ConfigModule.forRoot({ isGlobal: true, load: [configuration] })
```

**`.env.example`** commitado com todas as chaves mas sem valores reais. **`.env`** no `.gitignore`.

### Parte 2 — Docker

**Dockerfile multi-stage** (não single-stage):

```
Stage builder:
  FROM node:22-alpine AS builder
  WORKDIR /app
  COPY package*.json .
  RUN npm ci
  COPY . .
  RUN npm run build

Stage runner:
  FROM node:22-alpine AS runner
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/package.json .
  CMD ["node", "dist/main"]
```

Por que multi-stage: imagem final não carrega devDependencies, TypeScript compiler, source maps. Menor → mais rápida pra baixar em CI/CD, menor superfície de ataque.

**docker-compose.yml** com 3 serviços:

```yaml
services:
  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: ...

  redis:
    image: redis:7-alpine
    healthcheck: ...

  api:
    build: .
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    env_file: .env
```

`depends_on` com `condition: service_healthy` garante que a API só sobe depois que banco e redis estão prontos. Sem isso, a API tenta conectar antes do banco estar pronto e crasha.

## Conceitos que serão avaliados

- Por que `COPY package*.json .` antes de `COPY . .` (cache de layers — se código muda mas deps não, npm ci não roda de novo)
- Diferença entre `ENV` no Dockerfile e `env_file` no compose
- `volumes` nomeados vs bind mounts
- Healthcheck: como o compose usa para orquestrar ordem de inicialização
- Por que não rodar como root dentro do container (segurança — opcional mas bom saber)

## Libs necessárias

```bash
npm i @nestjs/config
```

Docker e Docker Compose são ferramentas da máquina, não pacotes npm.

## Checklist de entrega

**Config:**
- [ ] `@nestjs/config` instalado e `ConfigModule.forRoot({ isGlobal: true })` configurado
- [ ] `configuration.ts` exportando objeto tipado com todas as variáveis
- [ ] Zero `process.env.X` no código — tudo via `ConfigService`
- [ ] `.env` no `.gitignore`
- [ ] `.env.example` commitado com todas as chaves sem valores

**Docker:**
- [ ] `Dockerfile` multi-stage (builder + runner)
- [ ] `docker-compose.yml` com postgres, redis e api
- [ ] Healthcheck configurado em postgres e redis
- [ ] `api` usa `depends_on` com `condition: service_healthy`
- [ ] `docker-compose up` sobe tudo sem erro
- [ ] API responde em `localhost:3000` após compose up
- [ ] Dados persistem em volume (não se perdem ao `docker-compose down`)
- [ ] `docker-compose down -v` limpa volumes (entender a diferença)
