# Proposal

## Why

A entrada do Pacinho ainda pede e-mail e senha, e a conta nasce sem o perfil que o card de match mostra. A pessoa cai no deck podendo dar like sem foto, objetivo ou ritmo. A tela inicial passa a ser só Apple ou Google, e a conta nova só chega no deck depois do cadastro que esse card precisa.

## What Changes

- No build de lançamento, a tela inicial oferece só entrar com a Apple e entrar com o Google. Some o formulário de e-mail, senha, nome e celular. **BREAKING** para quem entrava com e-mail e senha.
- Em desenvolvimento, a tela inicial também oferece uma entrada sem Apple, Google ou development build. Ela abre uma sessão de um perfil que já está completo, no Expo Go, para atravessar Gente, Eventos, Matches e Perfil. Fora de desenvolvimento essa entrada não existe.
- A primeira entrada cria a conta a partir da identidade verificada do provedor. Uma entrada seguinte na mesma identidade reabre a sessão. E-mail verificado que já existe liga o provedor a essa conta, em vez de criar outra.
- Conta nova, ou conta sem o perfil completo, fica no cadastro inicial. O app só libera o resto quando há nome, idade, gênero, cidade, região, objetivo, ritmo, distância, bio e pelo menos uma foto. Nome vem preenchido quando o provedor envia.
- Ao concluir, o app abre o deck que já existe (aba Gente), onde like e deslike continuam sendo `LIKE` e `PASS`. A aba Matches continua sendo a lista de likes mútuos.
- A melhoria visual desta change cobre a tela inicial, o cadastro inicial e o deck. Eventos, perfil e a lista de matches ficam para outra change.
- Celular deixa de ser obrigatório na entrada. A change `prepare-monorepo` ainda descreve o contrato antigo de e-mail e senha. Se as duas andarem juntas, vale este contrato.

## Capabilities

### New Capabilities

- `social-sign-in`: sessão por Apple ou Google e, em desenvolvimento, entrada no Expo Go sem development build.
- `profile-onboarding`: cadastro inicial obrigatório e, ao terminar, abertura do deck de like e deslike.

### Modified Capabilities

- Nenhuma. `openspec/specs/` ainda não tem capacidades. O contrato de e-mail e senha vive só na change `prepare-monorepo`.

## Impact

- `mobile/src/app/index.tsx` e o formulário de auth perdem e-mail e senha. O gate de sessão passa a mandar perfil incompleto para o cadastro, e perfil completo para a aba Gente.
- A API deixa de criar sessão em `/signup` e `/signin`. Passa a aceitar a identidade da Apple e do Google, guardar o sujeito do provedor e receber a foto do cadastro.
- Não há upload de foto hoje. O deck só enxerga URL em `user_media`.
- iOS e Android. Web fica de fora desta change.
- Entrar com Google ou Apple no build de lançamento exige development build. O caminho de desenvolvimento usa o Expo Go e não pede esse build.
