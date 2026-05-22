# Módulo 5 — Testes (Unit + e2e)

## Objetivo

Testar o que foi construído nos módulos anteriores. Aprender a diferença entre unit e e2e, como mockar dependências no NestJS, e como rodar testes e2e contra banco real.

## Dois tipos, dois propósitos

**Unit test:** testa uma unidade isolada (o service) com todas as dependências mockadas. Rápido, sem I/O, roda em qualquer máquina sem banco.

**e2e test:** sobe a aplicação inteira e faz requisições HTTP reais. Lento, requer banco. Testa o fluxo como o cliente vê — incluindo validação, guards, interceptors, pipes.

Ambos são necessários. Unit test não substitui e2e.

## Unit tests — ProductsService

Mock do repository:

```ts
const mockRepo = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};
```

Setup:

```ts
const module = await Test.createTestingModule({
  providers: [
    ProductsService,
    { provide: getRepositoryToken(Product), useValue: mockRepo },
  ],
}).compile();
```

### Casos obrigatórios

- `findAll()` → chama `repo.find()`, retorna resultado
- `findOne(id)` existente → chama `repo.findOneBy({ id })`, retorna produto
- `findOne(id)` inexistente → `findOneBy` retorna `null` → lança `NotFoundException`
- `create(dto)` → chama `repo.create(dto)` + `repo.save()`, retorna produto
- `update(id, dto)` existente → encontra, aplica mudanças, salva, retorna atualizado
- `update(id, dto)` inexistente → lança `NotFoundException`
- `remove(id)` existente → encontra, chama `repo.remove()`, retorna produto removido
- `remove(id)` inexistente → lança `NotFoundException`

## e2e tests — fluxo HTTP completo

Banco de teste separado (não o banco de dev). Limpar tabelas antes de cada teste.

Setup:

```ts
const app = await Test.createTestingModule({ imports: [AppModule] })
  .compile()
  .then(m => m.createNestApplication().init());

const http = () => request(app.getHttpServer());
```

### Casos obrigatórios

- `GET /products` → 200 + array (pode estar vazio)
- `POST /products` body válido → 201 + produto com id
- `POST /products` body inválido (campo faltando) → 400
- `POST /products` campo extra → 400 (`forbidNonWhitelisted`)
- `GET /products/:id` existente → 200 + produto correto
- `GET /products/:id` inexistente → 404
- `PUT /products/:id` → 200 + dados atualizados
- `DELETE /products/:id` → 204 sem body
- `DELETE /products/:id` inexistente → 404
- `GET /products/:id` depois de DELETE → 404

Se o módulo 4 foi integrado, adicionar:
- Rota protegida sem token → 401
- Rota protegida com token válido → sucesso

## Conceitos que serão avaliados

- Diferença entre `jest.fn()` e `jest.spyOn()`
- Por que mockar o repository e não o banco
- `beforeEach` vs `beforeAll`: quando usar cada um
- Por que banco de teste separado (não polui dados de dev, testes são idempotentes)
- Coverage: o que significa, o que não significa

## Libs necessárias

```bash
npm i -D supertest @types/supertest
```

Jest e `@nestjs/testing` já vêm no scaffold.

## Checklist de entrega

**Unit (ProductsService):**
- [ ] Todos os 8 casos implementados
- [ ] Mock do repository configurado corretamente
- [ ] Testes de exceção usando `.rejects.toThrow(NotFoundException)`
- [ ] `npm run test` passa sem erros

**e2e (ProductsController):**
- [ ] Banco de teste configurado (variável de ambiente separada ou banco diferente)
- [ ] Tabelas limpas antes de cada teste
- [ ] Todos os 10 casos implementados
- [ ] `npm run test:e2e` passa sem erros
- [ ] Nenhum teste depende de outro (ordem de execução não importa)
