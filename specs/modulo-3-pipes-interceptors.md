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

- [x] `HttpExceptionFilter` implementado e registrado globalmente
- [x] Todas as respostas de erro seguem o formato padronizado
- [x] `ParseUUIDPipe` aplicado no parâmetro `:id` (PK é uuid, não int)
- [x] Request com `:id` inválido → 400 (não 500)
- [x] `LoggingInterceptor` implementado e registrado globalmente
- [x] Toda requisição loga método + rota + status + tempo
- [x] `TransformInterceptor` implementado e registrado globalmente
- [x] Toda resposta de sucesso retorna `{ data: ... }`
- [x] Saber explicar: qual peça captura exceção? qual envolve a execução? qual transforma entrada?

## Entregue — desvios intencionais da spec (escolhas melhores)

- **Registro via DI, não `useGlobal*`:** filtro e interceptors registrados com `APP_FILTER` / `APP_INTERCEPTOR` no `AppModule` (tokens multi-provider), em vez de `app.useGlobal*()` no `main.ts`. Mantém o `main.ts` enxuto e abre porta pra injeção de dependência nas peças globais.
- **`ParseUUIDPipe` no lugar de `ParseIntPipe`:** o PK do `Product` é uuid; `ParseIntPipe` seria incorreto.
- **Guard no `TransformInterceptor`:** não embrulha resposta sem corpo (`DELETE` → 204). Sem isso, geraria `{}` à toa. Tipo de saída ficou `Response<T> | undefined`.
- O `ValidationPipe` continua no `main.ts` (não foi pra DI): ele recebe opções configuradas e não precisa injetar nada — mover pra `APP_PIPE` perderia a config (`useClass`) ou não ganharia DI (`useValue`).
