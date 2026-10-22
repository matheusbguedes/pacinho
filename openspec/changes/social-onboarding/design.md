# Design

## Context

A tela inicial abre um formulário de e-mail e senha. O cadastro pede nome, e-mail, senha e celular, e em seguida o gate manda para a aba Gente. O card de match já mostra foto, idade, gênero, cidade, região, objetivo, ritmo, distância e bio, mas a conta nova não preenche isso. Não existe rota de upload. Foto no banco é URL em `user_media`, hoje só pelo seed. Ver `proposal.md`.

## Goals / Non-Goals

**Goals:**

- Sessão só com identidade verificada da Apple ou do Google, no servidor que existir quando a change começar (hoje Fastify em `server/`).
- Um bit derivado, `profile_complete`, calculado na resposta do perfil. Verdadeiro só com nome, idade, gênero, cidade, região, objetivo, ritmo, distância, bio e ao menos uma mídia.
- Cadastro inicial numa tela só, rolável, e ao salvar o app troca para a aba Gente.
- Ajuste visual da tela inicial, desse cadastro e do deck, sem mudar o gesto de like e deslike.
- Em desenvolvimento, uma entrada no Expo Go abre a sessão de um corredor do seed, com perfil completo, sem development build.

**Non-Goals:**

- Web, wizard de vários passos, celular obrigatório, e redesign de eventos, perfil ou da lista de matches.
- Trocar `LIKE` / `PASS` ou a regra de match por par.
- Subir a foto para um bucket. Nesta change a API grava o arquivo e serve a URL.
- Portar a API para Nest. Isso continua em `prepare-monorepo`.

## Decisions

### Sujeito do provedor, não a senha

Nova tabela de identidade: provedor `APPLE` ou `GOOGLE` mais o `sub` verificado, único nesse par, ligado ao usuário. O token de sessão continua o JWT atual, sem senha no corpo. `password` deixa de ser credencial. A coluna pode ficar nula para não quebrar linha antiga. `/signup` e `/signin` saem.

A Apple manda o e-mail quase só na primeira autorização. O sistema guarda o e-mail quando ele vem e, nas próximas, acha a conta pelo `sub`. Se o `sub` é novo e o e-mail verificado já existe, liga o provedor a essa conta.

Alternativa considerada: tratar o e-mail como chave. Quebra quando a Apple esconde ou troca o e-mail.

### Completude calculada

`profile_complete` não é coluna. A API calcula na leitura do próprio perfil. O deck e o envio de like ou deslike respondem 403 enquanto for falso. O app, com sessão e perfil incompleto, só renderiza o cadastro.

Alternativa considerada: booleano gravado no usuário. Ele mente quando a foto é apagada.

### Uma tela de cadastro, não um wizard

Os nove dados cabem numa tela rolável, com o nome já preenchido. Um passo por campo aumenta abandono e estado pela metade. A foto entra nessa mesma tela. O endpoint recebe a imagem, grava em disco servido pela API e cria `user_media`. Uma foto basta para o gate.

### Visual só nas três superfícies

Na implementação, a tela inicial, o cadastro e o deck seguem as skills de interface já instaladas (`expo-overview` e a folha que ela indicar, mais frontend design). O deck continua com swipe, `LIKE` e `PASS`. Eventos e as outras abas não entram no redesenho.

### Entrada de desenvolvimento no Expo Go

Apple e Google nativos não cabem no Expo Go. Em desenvolvimento, a tela inicial mostra um terceiro controle, só quando `__DEV__` é verdadeiro. Ele chama uma rota que só existe com `NODE_ENV=development` e devolve o JWT de um usuário do seed que já tem os dados do card e foto. O agente cai na aba Gente e abre Eventos, Matches e Perfil sem preencher cadastro e sem gerar development build.

Fora de desenvolvimento a rota responde como se não existisse e o controle não entra no bundle de lançamento. IDs de cliente da Apple e do Google ficam em variável de ambiente, fora do git, e não são necessários para atravessar as telas. No iOS de lançamento, o botão da Apple continua obrigatório porque o outro login social existe.

Alternativa considerada: development build para todo mundo que for clicar no app. Trava o agente e qualquer passagem de tela.

## Risks / Trade-offs

- [Conta de teste que só tem senha] → deixa de entrar, a menos que o e-mail verificado do provedor seja o mesmo e a identidade ligue na conta. Não há migração de senha.
- [Arquivo local não sobrevive a mais de uma instância] → aceitável até existir um bucket. A URL precisa abrir no app.
- [Atalho de desenvolvimento vaza no lançamento] → o controle só existe com `__DEV__` e a rota só responde com `NODE_ENV=development`. Os dois lados recusam.
- [`prepare-monorepo` ainda descreve e-mail e senha] → esta change vale se as duas forem aplicadas. A porta Nest não recria `/signup` e `/signin`.

## Migration Plan

Aplicar no app e na API atuais, antes do monorepo. Sem usuário em produção, não há janela de senha. Rollback é reverter o commit. A migration só adiciona a identidade e relaxa a senha. Não apaga usuário.

## Open Questions

Nenhuma.
