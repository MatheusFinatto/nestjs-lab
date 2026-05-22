# Módulo 7 — Filas (BullMQ + Redis) + Idempotência

## Objetivo

Implementar processamento assíncrono com fila. O endpoint retorna imediatamente; o trabalho pesado acontece em background. Aprender retry exponencial, dead-letter queue e idempotência — os três conceitos que aparecem em todo sistema distribuído.

## Domínio

`Order { id, externalId, customerName, productSku, quantity, unitPrice, status }`

`status`: `pending | processing | done | failed`

## Fluxo esperado

```
POST /orders
  → valida body
  → persiste order com status=pending
  → enfileira job com { orderId }
  → retorna 202 Accepted imediatamente (não espera processamento)

Worker consome job:
  → atualiza status=processing
  → processa (simular com setTimeout ou lógica real)
  → sucesso → status=done
  → falha transitória → retry (até 3x, backoff exponencial)
  → falha permanente → status=failed, move para DLQ

GET /orders/:id → retorna order com status atual
GET /orders/dlq → lista orders em status=failed
```

## Idempotência

`externalId` é o identificador do pedido no sistema externo (marketplace, parceiro). Deve ser `UNIQUE` no banco.

Se o mesmo pedido chegar duas vezes (retry do remetente, bug de rede):
- Segunda inserção falha na constraint UNIQUE
- Sistema retorna 200 sem reprocessar (não é erro — é comportamento correto)

```ts
// Implementar no service:
const existing = await this.ordersRepo.findOneBy({ externalId: dto.externalId });
if (existing) return existing; // idempotente
```

## Retry exponencial

```ts
// Configuração do job:
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // 2s → 4s → 8s
  },
}
```

Falha transitória = qualquer exceção lançada no processor. BullMQ vai retentar automaticamente até esgotar as tentativas.

## Dead-letter queue (DLQ)

BullMQ não tem DLQ nativa — você implementa:

```ts
// No worker, ouvir evento 'failed':
worker.on('failed', async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    // todas as tentativas esgotadas → mover pra DLQ
    await this.ordersService.markAsFailed(job.data.orderId, err.message);
  }
});
```

Ou usar `@OnWorkerEvent('failed')` com o decorator do `@nestjs/bullmq`.

## Conceitos que serão avaliados

- Por que fila e não processamento síncrono (desacoplamento, resiliência, SLA do endpoint)
- At-least-once delivery: a fila pode entregar o mesmo job mais de uma vez → idempotência é sua responsabilidade, não da fila
- Diferença entre falha transitória (network timeout, DB lock) e falha permanente (validação, FK inexistente)
- Por que backoff exponencial e não retry imediato (dar tempo pro sistema se recuperar)
- Redis como broker: jobs ficam em listas Redis — BullMQ só é uma abstração sobre isso

## Libs necessárias

```bash
npm i bullmq @nestjs/bullmq
```

`ioredis` é instalado como dependência do BullMQ automaticamente.

## Checklist de entrega

- [ ] Redis rodando (Docker: `docker run -p 6379:6379 redis:7-alpine`)
- [ ] `BullModule.forRoot()` configurado com conexão Redis no `AppModule`
- [ ] `OrdersModule` com fila `orders-queue`
- [ ] `Order` entity com `externalId UNIQUE`, `status`, `lastError`
- [ ] `POST /orders` → valida body, verifica idempotência, persiste, enfileira, retorna 202
- [ ] `POST /orders` com mesmo `externalId` → 200 sem criar duplicata
- [ ] Processor implementado com `@Processor('orders-queue')` e `@Process()`
- [ ] Processor atualiza status para `processing` → `done`
- [ ] Retry configurado: `attempts: 3`, backoff exponencial
- [ ] Falha simulada no processor → ver retries acontecendo (logar tentativas)
- [ ] Após 3 falhas → order marcada como `failed` com razão do erro
- [ ] `GET /orders/:id` → retorna order com status atual
- [ ] `GET /orders/dlq` → lista orders com status `failed`
- [ ] Fluxo completo testado manualmente:
  - [ ] POST → 202 imediato
  - [ ] GET logo depois → status `pending` ou `processing`
  - [ ] GET depois de alguns segundos → status `done`
  - [ ] Simular falha → ver status `failed` após retries
