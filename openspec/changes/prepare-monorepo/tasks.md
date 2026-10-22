# Tasks

## 1. Workspace com os apps ainda em Fastify

- [x] 1.1 Criar na raiz `package.json` privado, `pnpm-workspace.yaml` (`apps/*`, `packages/*`) e `turbo.json` com `build`, `lint`, `typecheck` e `dev`, e fixar `packageManager` na versão de pnpm da máquina. Verificar que os três arquivos existem e que o yaml lista esses dois globs.
- [x] 1.2 Mover `server/` para `apps/api` e `mobile/` para `apps/mobile` com `git mv`, renomear os pacotes para `@pacinho/api` e `@pacinho/mobile`, levar `.env` e `.env.example` junto, e apagar os `package-lock.json` aninhados. Verificar que `git status` mostra rename, que `.env` continua ignorado (`git check-ignore`) e que não resta lockfile npm.
- [x] 1.3 Instalar na raiz com pnpm. Verificar que só existe `pnpm-lock.yaml` na raiz e que `pnpm install` termina sem erro.
- [x] 1.4 Subir o Postgres com o compose agora em `apps/api` e o script de dev da API. Verificar que `GET /health` responde 200 com `server: up` e `database: up`.
- [x] 1.5 Rodar lint e `tsc --noEmit` do mobile no caminho novo, sem criar `metro.config.js`. Verificar que os dois comandos saem 0.
- [x] 1.6 Escrever `AGENTS.md` na raiz e atualizar `apps/mobile/AGENTS.md` como no design: mapa e ponteiros na raiz, guia de Expo conservado no mobile mais a regra de install na raiz, `expo install` neste app e contrato em `@pacinho/shared`. Verificar que a raiz aponta para `openspec/specs/` e para os dois apps, e que o mobile ainda manda ler a doc do Expo pela versão do `package.json`.

## 2. Contrato HTTP compartilhado

- [x] 2.1 Criar `packages/shared` (`@pacinho/shared`) com schemas Zod das quatro capacidades e build `tsc` para `dist`. Verificar que `pnpm --filter @pacinho/shared build` gera `dist` e que o pacote não importa React, Nest nem Prisma.
- [x] 2.2 Escrever `packages/shared/AGENTS.md` dizendo que o pacote é só o contrato serializável e que mudar schema pede delta no OpenSpec. Verificar que o arquivo existe e cabe nessas duas regras.
- [x] 2.3 Trocar os schemas inline das rotas Fastify pelos schemas de `@pacinho/shared`, com dependência `workspace:*`. Verificar que o build da API passa e que `apps/api/src/routes` não declara mais `z.object` de corpo ou query.
- [x] 2.4 Trocar os DTOs manuais do mobile pelos tipos inferidos de `@pacinho/shared`. Verificar que `tsc --noEmit` do mobile passa e que `mobile/src/types/user.ts`, `modules/events/types.ts` e `modules/match/types.ts` não redefinem o payload HTTP.

## 3. API NestJS

- [x] 3.1 Adicionar o esqueleto Nest em `apps/api` com `PrismaModule` global e `GET /health` no mesmo formato de hoje, sem apagar o Fastify ainda. Verificar, com o compose no ar, que o health do Nest responde 200 com `server` e `database` up.
- [x] 3.2 Implementar o módulo de auth com o payload e a expiração de 365 dias do design, mais o guard JWT e o guard admin. Se `social-onboarding` ainda não entrou, cobrir os cenários de `account-access`. Se já entrou, não recriar `/signup` nem `/signin` e cobrir `social-sign-in` e o 403 de perfil incompleto. Verificar que o teste do contrato que estiver valendo passa, inclusive 401.
- [x] 3.3 Implementar o módulo de perfil e cobrir os cenários de `runner-profile`. Verificar que o teste passa, inclusive idade, bio, objetivo, gênero e ausência de senha.
- [x] 3.4 Implementar o módulo de provas e cobrir os cenários de `race-events`. Verificar que o teste passa, inclusive lista só do que ainda vai acontecer, presença idempotente, 403 de quem não é admin e `ticket_url` externo.
- [x] 3.5 Implementar o módulo de match e cobrir os cenários de `runner-match`. Verificar que o teste passa, inclusive like recíproco, pass sem match e a ação por par valendo também no deck da prova.
- [ ] 3.6 Remover Fastify, `tsup` e os pacotes `@fastify/*`, e fazer o script de start subir o Nest. Verificar que `package.json` da API não cita `fastify` e que `pnpm --filter @pacinho/api build` termina sem erro.
- [ ] 3.7 Escrever `apps/api/AGENTS.md` com módulos por capacidade, Zod de `@pacinho/shared`, Prisma só na API, e a decisão de não usar `class-validator` nem repositório genérico. Verificar que o arquivo cita essas quatro regras e aponta as specs como trava de status e mensagem.

## 4. Integração

- [ ] 4.1 Rodar build, lint e typecheck pelo Turbo na raiz. Verificar que o comando único sai 0 nos três pacotes.
- [ ] 4.2 Confirmar que o Metro do Expo SDK 57 resolve `@pacinho/shared` sem `metro.config.js` manual. Verificar com `npx expo start` em `apps/mobile` que o bundle sobe, e com `pnpm why react-native` que existe uma versão só. Se o install isolado quebrar módulo nativo, aplicar `nodeLinker: hoisted` e repetir essa verificação.

## Workflow follow-up

- Arquivar a change quando a revisão do repositório estiver satisfeita.
- Conferir o resultado arquivado e as specs promovidas para `openspec/specs/`.
