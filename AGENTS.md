# Pacinho

Monorepo pnpm + Turborepo. O comportamento de produto está em `openspec/specs/`. Enquanto uma change está aberta, o delta fica em `openspec/changes/<nome>/specs/`.

## Mapa

- `apps/api` — API. Dono: Agente Server. Ao editar, leia a skill `nestjs-best-practices` e `apps/api/AGENTS.md`.
- `apps/mobile` — app Expo. Dono: Agente Mobile. Ao editar, leia a skill `expo-overview` e `apps/mobile/AGENTS.md`. Ao mudar UI, leia `frontend-design` e `ui-ux-pro-max`.
- `packages/shared` — contrato HTTP. Dono: Agente Server. Ao editar, leia `packages/shared/AGENTS.md`.

Cada agente edita só a própria árvore. Campo, status ou rota que a tela precisa e o contrato não tem: o Agente Mobile pergunta ao Agente Server. Payload que o app já lê: o Agente Server avisa o Agente Mobile.

## Comandos

Rode na raiz. O install do workspace também é só aqui.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Dependência nativa do app entra com `npx expo install` dentro de `apps/mobile`.
