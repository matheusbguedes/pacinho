# Proposal

## Why

O Pacinho já é um app social para quem corre em São Paulo: a pessoa cria conta, define se quer romance, amizade ou treino, confirma presença em provas e dá like ou pass em outras pessoas, inclusive entre quem vai ao mesmo evento. O código faz isso hoje, mas o repositório não aguenta vários agentes ao mesmo tempo. A API Fastify e o app Expo são projetos npm separados, os tipos do contrato HTTP estão duplicados, e só o mobile tem `AGENTS.md`. Sem um monorepo, um contrato único e um guia por app, o próximo agente reescreve o mobile ou inventa uma segunda API.

## What Changes

- Documentar o comportamento atual de conta, perfil de corredor, eventos e match como contrato do produto. Esta change preserva esse comportamento, fora a entrada. A change `social-onboarding` substitui e-mail e senha por Apple e Google. Se ela já estiver aplicada, a porta da API segue esse contrato e não recria `/signup` nem `/signin`. Esta change não cria chat em tempo real, checkout de ingresso, restrição geográfica no banco nem redesign de tela.
- Transformar o repositório em monorepo pnpm + Turborepo. **BREAKING** para caminhos, gerenciador de pacotes e forma de subir os apps. O contrato HTTP (rotas, status e payloads que o mobile já consome) permanece.
- Mover `server/` para `apps/api` e substituir Fastify por NestJS, em módulos por capacidade. **BREAKING** para o runtime do servidor. Prisma, PostgreSQL, JWT e o `docker-compose` continuam na API.
- Mover `mobile/` para `apps/mobile` sem recriar o app. Expo SDK 57, Expo Router e as telas atuais permanecem.
- Criar `packages/shared` (`@pacinho/shared`) como dono do contrato HTTP: schemas Zod e os tipos inferidos. A API valida com esses schemas. O mobile deixa de manter DTOs paralelos. Modelos Prisma não entram nesse pacote.
- Adicionar `AGENTS.md` na raiz, em `apps/api`, em `apps/mobile` e em `packages/shared`. Cada arquivo aponta para a skill daquele diretório e guarda só a regra que o código não mostra. O `AGENTS.md` do Expo que já existe é a base do mobile, não um texto novo do zero.
- Ingresso continua link externo (`ticket_url`). A aba Chats continua listando matches mútuos. Match continua único por par de pessoas (`from_id`, `to_id`), não por evento. São Paulo continua foco de produto, sem virar constraint de schema nesta change.

## Capabilities

### New Capabilities

- `account-access`: cadastro e sessão por e-mail e senha, com JWT no cliente.
- `runner-profile`: perfil público de corredor, inclusive objetivo (romance, amizade ou treino), ritmo, distância, cidade e região.
- `race-events`: provas futuras, link externo de ingresso, confirmação de presença e lista de quem vai.
- `runner-match`: deck de pessoas, like ou pass, match mútuo e filtro por quem confirmou presença num evento.

### Modified Capabilities

- Nenhuma. `openspec/specs/` ainda não tem capacidades.

## Impact

- `server/` e `mobile/` saem da raiz. Lockfiles npm aninhados saem. Entra um `pnpm-lock.yaml` na raiz.
- O app mobile passa a importar `@pacinho/shared`. Os serviços HTTP atuais continuam os mesmos paths.
- A API nova precisa responder o que `server/src/routes/` responde hoje: `/signup`, `/signin`, `/users/me`, `/events`, `/events/:id`, `/events/:id/attend`, `/matches/people`, `/matches` e `/health`.
- Agentes no Maestri passam a ter um mapa na raiz e um guia curto por app. Skills já instaladas (NestJS, Expo, React Native, escrita de `AGENTS.md`) são a referência de implementação. Esta change não configura o canvas do Maestri.
