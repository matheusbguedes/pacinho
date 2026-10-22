# Tasks

## 1. Identidade Apple e Google

- [ ] 1.1 Criar a identidade por provedor (`APPLE` ou `GOOGLE` + `sub`) e permitir senha nula, sem apagar usuário existente. Verificar que a migration aplica no Postgres do compose.
- [ ] 1.2 Verificar o token da Apple e o do Google no servidor e abrir sessão no JWT atual. Primeira identidade cria conta. O mesmo `sub` reabre a conta. E-mail verificado já existente liga o provedor a essa conta. Verificar com teste de API os três casos e a identidade inválida, e que a resposta traz `token` e `user` sem senha.
- [ ] 1.3 Remover `/signup` e `/signin`. Verificar que um pedido só com e-mail e senha não devolve token.
- [ ] 1.4 Calcular `profile_complete` na leitura do próprio perfil e responder 403 no deck e no like/deslike enquanto for falso. Rotas sem token continuam 401 com "Não autorizado". Verificar esses dois status no teste de API.
- [ ] 1.5 Abrir sessão de desenvolvimento só com `NODE_ENV=development`, no usuário do seed que já tem os dados do card e foto. Com outro `NODE_ENV`, a rota não cria sessão. Verificar os dois casos no teste de API e que a resposta não traz senha.

## 2. Foto do cadastro

- [ ] 2.1 Receber uma imagem autenticada, gravar arquivo servido pela API e criar `user_media` com essa URL. Verificar que a URL abre e que o perfil passa a contar essa mídia.

## 3. App

- [ ] 3.1 Trocar a tela inicial para Apple e Google, sem campo de e-mail, senha, nome ou celular. Em desenvolvimento, mostrar a entrada que chama a rota de desenvolvimento. Verificar que os campos de e-mail e senha não existem, que os dois provedores existem e que a entrada de desenvolvimento só aparece com `__DEV__`.
- [ ] 3.2 Mandar sessão com `profile_complete` falso só para o cadastro rolável, com nome preenchido quando o provedor mandou. Verificar que, com perfil incompleto, a rota protegida não abre a aba Gente.
- [ ] 3.3 No cadastro, coletar nome, idade, gênero, cidade, região, objetivo, ritmo, distância, bio e uma foto, e gravar pelos endpoints atuais mais o upload. Verificar que, ao concluir, o app abre a aba Gente e que uma nova abertura com perfil completo não mostra o cadastro.
- [ ] 3.4 Ajustar o visual da tela inicial, do cadastro e do deck com as skills de interface do Expo e de frontend design, mantendo swipe, `LIKE` e `PASS`. Verificar no Expo Go, pela entrada de desenvolvimento, que o app abre a aba Gente e que Eventos, Matches e Perfil abrem sem development build.
- [ ] 3.5 Documentar no `AGENTS.md` do mobile que atravessar as telas usa a entrada de desenvolvimento no Expo Go, e que os IDs da Apple e do Google não são necessários para isso. Verificar que o arquivo cita as duas regras.

## 4. Integração

- [ ] 4.1 Rodar os testes da API e o typecheck do mobile. Verificar que os dois saem 0.

## Workflow follow-up

- Aplicar esta change antes de portar a auth na `prepare-monorepo`.
- Arquivar quando a revisão estiver satisfeita e conferir as specs em `openspec/specs/`.
