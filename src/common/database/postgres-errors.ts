import { QueryFailedError } from 'typeorm';

/**
 * Códigos de erro do Postgres (SQLSTATE).
 * Ref: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PG_ERROR = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
} as const;

/**
 * O erro cru do driver `pg`, exposto via `QueryFailedError.driverError`.
 * TypeORM tipa `driverError` como `any`, então estreitamos para o que usamos.
 */
interface PostgresDriverError {
  code?: string;
  detail?: string;
  constraint?: string;
}

function getDriverError(err: unknown): PostgresDriverError | null {
  if (err instanceof QueryFailedError) {
    return err.driverError as PostgresDriverError;
  }
  return null;
}

/**
 * `true` se o erro for violação de constraint UNIQUE (SQLSTATE 23505).
 * Opcionalmente filtra por nome da constraint, quando há mais de um UNIQUE
 * na tabela e você precisa distinguir qual estourou.
 */
export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  const driverError = getDriverError(err);
  if (driverError?.code !== PG_ERROR.UNIQUE_VIOLATION) {
    return false;
  }
  return constraint ? driverError.constraint === constraint : true;
}
