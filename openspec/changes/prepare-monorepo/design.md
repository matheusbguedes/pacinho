# Design

## Context

Hoje a raiz não tem workspace. `server/` é Fastify 5 + Prisma 7 + Zod 4 + JWT, com PostgreSQL no `docker-compose`. `mobile/` é Expo SDK 57 + Expo Router, com DTOs escritos à mão e um `AGENTS.md` que já manda ler a doc versionada do Expo. Não existe `metro.config.js`. O contrato observável está nas specs desta change. Ver `proposal.md` para o porquê.

## Goals / Non-Goals

**Goals:**

- Um único install na raiz, com pnpm e Turborepo, e os dois apps continuando a subir.
- A API NestJS responde as specs de `account-access`, `runner-profile`, `race-events` e `runner-match`, mais `GET /health` como está hoje.
- `@pacinho/shared` é a única definição dos schemas HTTP. API e mobile importam dali.
- Cada diretório de trabalho tem um `AGENTS.md` curto, que aponta para a skill daquele diretório.
- Tokens JWT já emitidos continuam válidos: mesmo `SERVER_SECRET`, mesmos campos no payload (`sub`, `id`, `name`, `email`, `phone`, `role`) e a mesma expiração de 365 dias.

**Non-Goals:**

- Mudar o schema Prisma, criar migration ou corrigir a unicidade de match por par.
- Recriar o app com `create-expo-app` ou reorganizar `src/app`.
- Adotar `class-validator` ou uma camada de repositório genérica.
- Configurar canvas do Maestri, EAS, CI de loja ou redesign de tela.
- Vender ingresso dentro do app.

## Decisions

### Monorepo pnpm + Turborepo, apps movidos e não recriados

Raiz com `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `turbo.json` e um `package.json` privado. Pacotes: `@pacinho/api`, `@pacinho/mobile`, `@pacinho/shared`. `server/` vira `apps/api` e `mobile/` vira `apps/mobile` com `git mv`, para o histórico ir junto. Lockfiles npm aninhados saem. O `packageManager` da raiz fixa a versão de pnpm da máquina.

Expo SDK 57 detecta workspace e configura o Metro sozinho. Esta árvore não tem `metro.config.js`, então ninguém cria um para `watchFolders` ou `nodeModulesPaths`. Dependência interna usa `workspace:*`. Install é na raiz. Dependência nativa do app entra por `npx expo install` a partir de `apps/mobile`.

Alternativa considerada: dois repositórios e um pacote publicado. Pior para agentes no mesmo workspace e para um app que ainda não tem versão pública do contrato.

Alternativa considerada: npm workspaces. O pedido é pnpm. SDK 57 aceita o install isolado do pnpm. Se um módulo nativo quebrar por isolamento, a mitigação é `nodeLinker: hoisted` no `pnpm-workspace.yaml`, não um Metro manual.

### NestJS por capacidade, Zod compartilhado na borda

Módulos: `Auth`, `Users`, `Events`, `Matches`, `Health`, e um `Prisma` global. Guard de JWT e guard de admin saem do módulo de auth. Controller fino, regra no service, Prisma injetado no service. Sem repositório genérico: só existe PostgreSQL, e a skill de NestJS que pede repositório seria camada sem segundo adaptador.

A skill de NestJS pede `class-validator`. Aqui não. O servidor já valida com Zod 4, e o mobile precisa dos mesmos tipos. `@pacinho/shared` exporta os schemas e os tipos inferidos. A API aplica esses schemas num pipe próprio. `class-validator` criaria um segundo contrato.

`@pacinho/shared` não importa React, Nest nem Prisma. Compila com `tsc` para `dist`, e os apps dependem do pacote pelo nome. Turbo faz `build` e `typecheck` dependerem de `^build`.

Variáveis atuais permanecem: `NODE_ENV`, `SERVER_PORT`, `SERVER_HOST`, `SERVER_SECRET`, `DATABASE_URL`. CORS continua liberado para o cliente Expo. Erro de validação continua 400 com `message` exibível. Onde hoje existe `issues`, a API mantém esse campo para o debug não piorar. As specs não obrigam a forma interna de `issues`.

Alternativa considerada: reescrever a validação em DTOs Nest e gerar tipos para o mobile. Dois lugares para a mesma regra, que é o problema atual.

### Ordem: workspace, contrato, depois a troca do runtime

1. Mover os apps e fazer os dois rodarem ainda com Fastify.
2. Extrair os schemas para `@pacinho/shared` e trocar a API Fastify e o mobile para importá-los. O comportamento não muda.
3. Portar rota a rota para Nest e apagar Fastify, `tsup` e os plugins `@fastify/*` quando as specs passarem.

Portar o framework no mesmo passo do move mistura duas falhas. O Fastify só sai no fim.

### AGENTS.md é mapa, não cópia de skill

Seguir a skill `writing-for-agents`: o arquivo sempre carregado fica curto, no positivo, e aponta para o material que só algumas tarefas precisam.

- Raiz: mapa dos diretórios, comando de install na raiz, e o ponteiro "comportamento de produto está em `openspec/specs/`". Ao editar `apps/api`, ler a skill de NestJS e `apps/api/AGENTS.md`. Ao editar `apps/mobile`, ler `expo-overview` e `apps/mobile/AGENTS.md`. Ao mudar UI, ler as skills de frontend design e UI/UX. Ao editar `packages/shared`, ler o `AGENTS.md` de lá.
- `apps/mobile`: conservar o `AGENTS.md` de Expo que já existe e acrescentar só o que o monorepo muda (install na raiz, `expo install` neste app, contrato em `@pacinho/shared`, telas continuam em `src/app`).
- `apps/api`: módulos por capacidade, Zod de `@pacinho/shared`, Prisma só aqui, specs como trava de status e mensagem. Sem repositório genérico e sem `class-validator`.
- `packages/shared`: só contrato serializável. Mudar schema é mudança de contrato e pede delta no OpenSpec.

Não duplicar a lista de scripts do `package.json`. Não colar as 40 regras de NestJS nem o guia de Expo.

### Teste de paridade na API, não suíte nova no mobile

Não há testes hoje. A porta para Nest ganha testes de API cobrindo os cenários das quatro specs e o `GET /health`, contra o Postgres do compose. O mobile desta change fecha com lint, `tsc --noEmit` e o fluxo atual abrindo contra a API. Sem suíte de UI nova.

## Risks / Trade-offs

- [Metro não resolve `@pacinho/shared`] → SDK 57 configura monorepo sozinho; install na raiz com `workspace:*`. Se falhar, export condition de source ou `nodeLinker: hoisted`. Não inventar `metro.config.js` de watch folder.
- [React ou React Native duplicado] → uma versão só, a do app. Conferir com `pnpm why`.
- [Porta Nest "melhora" status ou mensagem] → cada módulo só termina quando os cenários da spec correspondente passam. Mensagens citadas nas specs ficam literais.
- [Token antigo invalida no meio da migração] → mesmo segredo, payload e expiração. Nenhuma rotação de `SERVER_SECRET` nesta change.
- [`AGENTS.md` vira sedimento] → ponteiro para skill e para `openspec/specs/`. Regra local só quando o código não mostra a decisão (Zod em vez de class-validator, match único por par).
- [Unicidade de match por par esconde gente no deck da prova] → comportamento especificado de propósito. Corrigir é outra change.

## Migration Plan

Não há deploy nem migration de banco. Rollback é reverter o commit. `.env` e `.env.example` acompanham o app e continuam fora do git no caso do `.env`.

Ordem de corte: workspace com Fastify ainda no ar, contrato compartilhado com os dois clientes compilando, Nest no lugar do Fastify, Fastify removido. O compose sobe de `apps/api` como sobe hoje de `server/`.

## Open Questions

Nenhuma. Dúvida que mudasse spec, abordagem ou tarefas foi fechada acima.
