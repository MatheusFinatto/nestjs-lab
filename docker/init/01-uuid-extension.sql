-- A migration usa uuid_generate_v4() como default do id.
-- Essa função vem da extensão uuid-ossp, que não vem ligada por padrão.
-- Este script roda automaticamente quando o volume do Postgres é criado do zero.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
