# Módulo 2 — Banco Real (PostgreSQL + TypeORM)

## Objetivo

Substituir o array em memória do módulo 1 por PostgreSQL com TypeORM. Aprender entities, repository pattern e migrations — a forma correta de evoluir schema sem destruir dados.

## Domínio

Mesmo do módulo 1: `Product`. Mesmos endpoints, mesmas validações. A mudança é só na camada de persistência.

## Conceitos que serão avaliados

- `@Entity()`, `@Column()`, `@PrimaryGeneratedColumn()`, `@CreateDateColumn()`
- `TypeOrmModule.forRoot()` no `AppModule` com configuração via variáveis de ambiente
- `TypeOrmModule.forFeature([Product])` no `ProductsModule`
- `@InjectRepository(Product)` no service
- Repository methods: `find()`, `findOneBy()`, `create()`, `save()`, `remove()`
- Migrations: gerar, rodar, reverter — **nunca `synchronize: true`**
- Diferença entre `repo.create()` (instancia) e `repo.save()` (persiste)
- Diferença entre `repo.remove()` (requer entidade) e `repo.delete()` (requer id)

## Por que não `synchronize: true`

`synchronize: true` compara o schema atual com as entities e aplica as diferenças automaticamente. Em desenvolvimento parece conveniente. Em produção:
- Pode dropar colunas com dados reais
- Sem histórico de mudanças
- Impossível reverter

Migrations = controle explícito, auditável, reversível.

## Libs necessárias

```bash
npm i @nestjs/typeorm typeorm pg
```

## Configuração mínima esperada

```ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Product],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
})
```

## Checklist de entrega

- [ ] PostgreSQL rodando localmente (Docker ok: `docker run -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres`)
- [ ] `@nestjs/typeorm typeorm pg` instalados
- [ ] `TypeOrmModule.forRoot()` configurado no `AppModule`
- [ ] Entity `Product` com decorators TypeORM:
  - [ ] `@PrimaryGeneratedColumn()`
  - [ ] `@Column()` para name, price, stock
  - [ ] `@CreateDateColumn()` para createdAt
- [ ] `ProductsService` usando `Repository<Product>` injetado
- [ ] Todos os métodos do service usando repository (sem array em memória)
- [ ] `.env` com variáveis de DB (não hardcoded)
- [ ] Migration gerada e rodada (não `synchronize: true`)
- [ ] Dados persistem após reiniciar a aplicação
- [ ] Testado manualmente: criar produto → reiniciar servidor → GET ainda retorna o produto
