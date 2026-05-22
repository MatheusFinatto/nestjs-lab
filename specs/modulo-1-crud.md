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
| PUT    | /products/:id   | 200 + objeto atualizado | 404 / 400 |
| DELETE | /products/:id   | 204 sem body | 404           |

## Regras de negócio

- `id` gerado pelo service (não vem do body)
- PUT substitui o produto inteiro — todos os campos obrigatórios
- DELETE não retorna body

## Validações (class-validator)

**CreateProductDto:**
- `name` — `@IsString()`, `@IsNotEmpty()`
- `price` — `@IsNumber()`, `@IsPositive()`
- `stock` — `@IsInt()`, `@Min(0)`

**UpdateProductDto:** mesmas regras, todos obrigatórios.

Body com campo desconhecido → 400 (`forbidNonWhitelisted: true`).

## Conceitos que serão avaliados

- Anatomia correta de um módulo NestJS: `Module → Controller → Service`
- Injeção de dependência via construtor
- Separação de responsabilidades: controller só roteia, service tem a lógica
- REST conventions: verbo HTTP correto, sem verbos na URL, status codes corretos
- `ValidationPipe` global com `{ whitelist: true, forbidNonWhitelisted: true }`
- `NotFoundException` lançada no service (não no controller)

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
- [ ] `UpdateProductDto` com validações
- [ ] `ValidationPipe` global em `main.ts`
- [ ] `NotFoundException` no service para id inexistente
- [ ] Testado manualmente:
  - [ ] POST válido → 201
  - [ ] POST com campo faltando → 400
  - [ ] POST com campo extra → 400
  - [ ] GET /:id inexistente → 404
  - [ ] DELETE → 204 sem body
