# Módulo 4 — Auth (JWT + Guards)

> **Status: concluído** — autenticação JWT completa (register, login, guard global,
> `@Public()`, `@CurrentUser()`). Autorização (ownership/403) ficou de fora de propósito —
> `Product` não tem dono no lab; AuthZ será coberto no projeto final.

## Objetivo

Implementar autenticação JWT completa com Passport. Proteger rotas por padrão, liberar apenas as que forem explicitamente marcadas como públicas.

## Domínio

Adicionar `UsersModule` e `AuthModule` ao projeto do módulo anterior. Produtos continuam existindo — agora com rotas protegidas.

## Fluxo esperado

```
POST /auth/register  → cria usuário (email + senha hasheada)
POST /auth/login     → valida credenciais → retorna JWT

GET  /products        → público (sem token)
POST /products        → protegido (JWT obrigatório)
PATCH /products/:id   → protegido
DELETE /products/:id  → protegido
```

## Entidades

```ts
User {
  id: string          // UUID (PrimaryGeneratedColumn('uuid')) — não é number
  email: string       // UNIQUE
  passwordHash: string
  createdAt: Date
}
```

**Nunca** armazenar senha em texto plano. `bcrypt.hash(password, 10)` antes de salvar.

## JWT

Payload do token:
```json
{ "sub": "a1b2c3d4-...", "email": "user@example.com" }
```

`sub` é o UUID do usuário (string), não um inteiro. O tipo `JwtPayload` (`{ sub: string; email: string }`) é compartilhado entre quem assina (`AuthService`) e quem valida (`JwtStrategy`) — single source of truth.

- Assinar com `JwtService.sign(payload, { expiresIn: '7d' })`
- Secret via variável de ambiente (`JWT_SECRET`), nunca hardcoded
- Estratégia: extrair do header `Authorization: Bearer <token>`

## Arquitetura esperada

```
AuthModule
  AuthController  → POST /auth/register, POST /auth/login
  AuthService     → lógica de registro e login
  JwtStrategy     → valida token, retorna payload
  JwtAuthGuard    → usa JwtStrategy, lança 401 se inválido

UsersModule
  UsersService    → findByEmail(), create()
  User entity
```

`JwtAuthGuard` registrado **globalmente** — protege tudo por padrão.

## Decorator @Public()

Para liberar uma rota específica:

```ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

O guard verifica esse metadata antes de exigir token:

```ts
const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
  context.getHandler(),
  context.getClass(),
]);
if (isPublic) return true;
```

## Decorator @CurrentUser()

Extrair o usuário autenticado do request sem acessar `req` diretamente:

```ts
@Get('me')
getMe(@CurrentUser() user: UserPayload) {
  return user;
}
```

## Conceitos que serão avaliados

- Diferença entre autenticação (quem é você) e autorização (o que pode fazer)
- Por que JWT é stateless e o que isso implica (não dá pra invalidar um token antes do expirar sem estado externo)
- Por que bcrypt e não MD5/SHA (bcrypt é lento por design — dificulta brute force)
- `Reflector`: como guards leem metadata de decorators
- Ordem: guard roda antes do handler — se 401, handler não é executado

## Libs necessárias

```bash
npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm i -D @types/passport-jwt @types/bcrypt
```

## Checklist de entrega

- [x] `User` entity criada com migration
- [x] `POST /auth/register` → salva usuário com bcrypt hash, retorna `{ id, email }`
- [x] `POST /auth/register` com email duplicado → 409 Conflict
- [x] `POST /auth/login` com credenciais válidas → retorna `{ access_token }`
- [x] `POST /auth/login` com senha errada → 401
- [x] `JwtStrategy` implementada e registrada
- [x] `JwtAuthGuard` registrado globalmente
- [x] `@Public()` aplicado em `/auth/register` e `/auth/login`
- [x] `GET /products` marcado como `@Public()`
- [x] `POST /products` sem token → 401
- [x] `POST /products` com token válido → 201
- [x] `POST /products` com token expirado/inválido → 401
- [x] `@CurrentUser()` implementado e funcionando em pelo menos uma rota (`GET /auth/me`)
- [x] `JWT_SECRET` lido de variável de ambiente
