# API

Dono: Agente Server. A árvore é `apps/api` e o contrato em `packages/shared`. O app Expo é do Agente Mobile.

Módulos por capacidade: Auth, Users, Events, Matches, Health e Prisma global. Controller fino, regra no service. Prisma fica só aqui.

A borda HTTP valida com os schemas Zod de `@pacinho/shared`. Este app não usa `class-validator` nem um repositório genérico.

O status e a mensagem de cada erro seguem as specs em `openspec/specs/`. Enquanto a change estiver aberta, o delta está em `openspec/changes/<nome>/specs/`.

`tsx` não emite metadata de decorator. Dependência de construtor entra com `@Inject`.

## Comandos

Na raiz: `pnpm --filter @pacinho/api dev`, e o mesmo filtro para `lint`, `typecheck`, `test` e `build`.

O Postgres sobe com `docker compose up -d` neste diretório. O compose se chama `server`, para continuar no volume que já existe. Os testes usam o banco `pacinho_test` nesse Postgres.
