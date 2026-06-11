import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// O "envelope" da resposta. Todo sucesso sai embrulhado assim:
//   { data: <o que o controller retornou> }
// <T> é genérico: "data é do tipo T, seja qual for". Controller retorna
// Product -> T = Product. Retorna Product[] -> T = Product[]. Você não fixa
// o tipo; ele se adapta a cada rota.
export interface Response<T> {
  data: T;
}

@Injectable()
// NestInterceptor<T, R> tem dois tipos:
//   T = o que ENTRA  (o retorno do controller, "antes")
//   R = o que SAI    (a resposta transformada, "depois")
// Aqui: entra T, sai Response<T>. Traduz: "pego um T, devolvo { data: T }".
// É só tipagem — não muda comportamento, só dá autocomplete e erro de
// compilação se você embrulhar errado.
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T> | undefined
> {
  intercept(
    // context: a "requisição atual" (request, response, handler...).
    // Aqui NÃO usamos — o Transform só mexe no corpo da resposta, não precisa
    // olhar método/rota/status como o Logging precisava.
    context: ExecutionContext,
    // CallHandler<T>: o <T> é o que conserta o erro de lint.
    // Sem o <T>, handle() retorna Observable<any> -> data vira `any` ->
    // ESLint reclama "Unsafe assignment". Com <T>, handle() vira
    // Observable<T> -> data é T -> tudo tipado, zero `any`.
    next: CallHandler<T>,
  ): Observable<Response<T> | undefined> {
    // next.handle() = o Observable que vai EMITIR o retorno do controller.
    //   Nada rodou ainda; é um stream que dispara quando o controller termina.
    //
    // .pipe(map(...)) = intercepta esse valor no caminho de SAÍDA.
    //   map recebe o valor emitido e devolve OUTRO no lugar. Igual Array.map:
    //   pega x, retorna f(x). Só que opera no valor que sai do stream.
    //
    // (data) => ({ data }):
    //   data       = o que o controller retornou (ex: um Product)
    //   ({ data }) = shorthand de { data: data }. Os parênteses são
    //                OBRIGATÓRIOS numa arrow que retorna objeto literal —
    //                senão o { vira bloco de código, não objeto. (Você
    //                conhece de React: map(x => ({ ...x }))).
    //
    // Fluxo do tipo: T -> { data: T } = Response<T>. O T atravessa tudo:
    //   TransformInterceptor<T> -> CallHandler<T> -> data:T -> Response<T>.
    //
    // Resultado prático:
    //   controller devolve { id, name }
    //   cliente recebe     { data: { id, name } }
    // Guard: resposta sem corpo (DELETE void -> data é undefined) não é
    // embrulhada. Sem isso, geraria { data: undefined } -> "{}" à toa.
    return next
      .handle()
      .pipe(map((data) => (data === undefined ? undefined : { data })));
  }
}
