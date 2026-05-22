# Módulo 3 — Error Handling, Pipes, Interceptors

## Objetivo

Entender o pipeline de execução do NestJS e as peças que compõem ele. Padronizar respostas de erro, adicionar logging de requisições e transformar o formato de resposta de forma centralizada.

## Pipeline de execução (ordem importa)

```
Request
  → Middleware
  → Guard
  → Interceptor (entrada)
  → Pipe
  → Handler (controller method)
  → Interceptor (saída)
  → Exception Filter  ← captura qualquer exceção lançada em qualquer etapa
Response
```

Saber essa ordem de cabeça é pergunta comum em entrevista senior.

## O que construir

### 1. HttpExceptionFilter (global)

Padroniza todas as respostas de erro:

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "path": "/products/99",
  "timestamp": "2026-05-21T10:00:00.000Z"
}
```

Registrar em `main.ts` via `app.useGlobalFilters()`.

### 2. ParseIntPipe no `:id`

Validar que `:id` é um inteiro válido antes de chegar no handler. Usar o built-in do NestJS:

```ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {}
```

Sem pipe: `id` chega como string. Com pipe: número garantido, 400 automático se inválido.

### 3. LoggingInterceptor (global)

Loga entrada e saída de cada requisição:

```
[LoggingInterceptor] GET /products - 200 - 12ms
[LoggingInterceptor] POST /products - 400 - 3ms
```

Usar `Date.now()` antes e depois para calcular duração.

### 4. TransformInterceptor (global)

Envolve toda resposta de sucesso em `{ data: <resultado> }`:

```json
{ "data": [{ "id": 1, "name": "Mouse", "price": 99.9, "stock": 10 }] }
```

Registrar interceptors globalmente via `app.useGlobalInterceptors()`.

## Conceitos que serão avaliados

- Implementar `ExceptionFilter` com `@Catch(HttpException)`
- Implementar `NestInterceptor` com `Observable` e `tap`/`map` do RxJS
- Diferença entre escopo global, por controller e por handler
- Por que exception filter não é um interceptor (não pode capturar exceções lançadas dentro de interceptors de saída — edge case)
- `ExecutionContext`: como extrair `request` e `response` dele

## Libs necessárias

Nenhuma nova — tudo em `@nestjs/common` e `rxjs` (já incluso no NestJS).

## Checklist de entrega

- [ ] `HttpExceptionFilter` implementado e registrado globalmente
- [ ] Todas as respostas de erro seguem o formato padronizado
- [ ] `ParseIntPipe` aplicado no parâmetro `:id`
- [ ] Request com `:id` não numérico → 400 (não 500)
- [ ] `LoggingInterceptor` implementado e registrado globalmente
- [ ] Toda requisição loga método + rota + status + tempo
- [ ] `TransformInterceptor` implementado e registrado globalmente
- [ ] Toda resposta de sucesso retorna `{ data: ... }`
- [ ] Saber explicar: qual peça captura exceção? qual envolve a execução? qual transforma entrada?
