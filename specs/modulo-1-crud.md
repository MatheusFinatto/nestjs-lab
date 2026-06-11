# Módulo 1 — CRUD + REST + DTOs + Validação

## Objetivo

Construir uma API REST completa com NestJS usando apenas memória (sem banco). Foco em estrutura de módulos, convenções REST, DTOs e validação automática de body.

## Domínio

`Product { id, name, price, stock }`

## Endpoints esperados

| Método | Rota            | Resposta ok | Resposta erro |
|--------|-----------------|-------------|---------------|
| GET    | /products       | 200 + array | —             |
| GET    | /products/:id   | 200 + objeto | 404           |
| POST   | /products       | 201 + objeto criado | 400 (body inválido) |
| PATCH  | /products/:id   | 200 + objeto atualizado | 404 / 400 |
| DELETE | /products/:id   | 204 sem body | 404           |

## Regras de negócio

- `id` gerado pelo service (não vem do body)
- PATCH atualiza parcialmente — só os campos enviados mudam; os ausentes permanecem como estavam (merge, não replace)
- DELETE não retorna body

> **Por que PATCH e não PUT?** Update de produto é tipicamente parcial ("muda só o preço") — PUT obrigaria reenviar o objeto inteiro. PATCH é o verbo realista pra esse recurso, e força o aprendizado de `PartialType` + lógica de merge no service. PUT (replace, todos obrigatórios) é defensável quando o recurso é substituído por inteiro (ex: documento de config idempotente); não é o caso aqui.

## Validações (class-validator)

**CreateProductDto:**
- `name` — `@IsString()`, `@IsNotEmpty()`
- `price` — `@IsNumber()`, `@IsPositive()`
- `stock` — `@IsInt()`, `@Min(0)`

**UpdateProductDto:** `extends PartialType(CreateProductDto)` — herda as mesmas regras do create, mas todos os campos viram opcionais (`@IsOptional()` aplicado pelo `PartialType`). Nada de copiar decorator à mão. (`PartialType` vem de `@nestjs/mapped-types`.)

Body com campo desconhecido → 400 (`forbidNonWhitelisted: true`).

## Conceitos que serão avaliados

- Anatomia correta de um módulo NestJS: `Module → Controller → Service`
- Injeção de dependência via construtor
- Separação de responsabilidades: controller só roteia, service tem a lógica
- REST conventions: verbo HTTP correto, sem verbos na URL, status codes corretos
- `ValidationPipe` global com `{ whitelist: true, forbidNonWhitelisted: true }`
- `NotFoundException` lançada no service (não no controller)
- `PartialType` para derivar o DTO de update sem duplicar validação
- Update parcial no service: merge dos campos enviados sobre o registro existente, sem sobrescrever o resto com `undefined`

## Libs necessárias

```bash
npm i class-validator class-transformer
```

## Checklist de entrega

- [ ] Scaffold: `nest new .` dentro desta pasta
- [ ] `ProductsModule`, `ProductsController`, `ProductsService` criados via CLI (`nest g`)
- [ ] Array em memória no service (tipado, não `any[]`)
- [ ] Todos os 5 endpoints implementados
- [ ] `CreateProductDto` com validações
- [ ] `UpdateProductDto` via `PartialType(CreateProductDto)` (campos opcionais, sem cópia)
- [ ] `ValidationPipe` global em `main.ts`
- [ ] `NotFoundException` no service para id inexistente
- [ ] Testado manualmente:
  - [ ] POST válido → 201
  - [ ] POST com campo faltando → 400
  - [ ] POST com campo extra → 400
  - [ ] GET /:id inexistente → 404
  - [ ] DELETE → 204 sem body
