# Spec Delta

## Purpose

Abre a sessão do Pacinho com a Apple ou com o Google e, em desenvolvimento, sem development build.

## ADDED Requirements

### Requirement: Lançamento só tem Apple e Google
O build de lançamento MUST oferecer apenas entrar com a Apple e entrar com o Google.

#### Scenario: Build de lançamento sem sessão
- **WHEN** o app de lançamento abre sem sessão
- **THEN** a tela mostra os dois provedores e não mostra campo de e-mail, senha, nome, celular nem entrada de desenvolvimento

### Requirement: Desenvolvimento entra no Expo Go
Em desenvolvimento, o app MUST abrir uma sessão sem Apple, Google ou development build, num perfil que já tenha os dados do card, para as abas Gente, Eventos, Matches e Perfil.

#### Scenario: Entrada no Expo Go
- **WHEN** o app em desenvolvimento abre sem sessão e a pessoa usa a entrada de desenvolvimento
- **THEN** a sessão abre no Expo Go, sem folha da Apple ou do Google, e o app cai na aba Gente com perfil completo

#### Scenario: Fora de desenvolvimento
- **WHEN** o servidor não está em desenvolvimento
- **THEN** a entrada de desenvolvimento não cria sessão

### Requirement: Identidade verificada abre sessão
O sistema MUST criar ou reabrir a conta a partir da identidade verificada do provedor e MUST devolver um token de sessão e o perfil, sem senha.

#### Scenario: Primeira entrada
- **WHEN** a pessoa envia uma identidade válida da Apple ou do Google que o sistema ainda não conhece, e o e-mail verificado não pertence a outra conta
- **THEN** o sistema cria uma conta de usuário comum e responde com `token` e `user`, e o `user` não contém senha

#### Scenario: Mesma identidade de novo
- **WHEN** a pessoa envia uma identidade válida cujo sujeito o sistema já guardou
- **THEN** o sistema reabre essa conta, mesmo que o e-mail do provedor tenha mudado, e responde com `token` e `user` sem senha

#### Scenario: E-mail verificado já existe
- **WHEN** a identidade é válida, o sujeito é novo e o e-mail verificado já pertence a uma conta
- **THEN** o sistema liga o provedor a essa conta e abre a sessão dela, sem criar outra conta

#### Scenario: Identidade inválida
- **WHEN** a identidade da Apple ou do Google não confere
- **THEN** o sistema recusa a entrada com uma mensagem que o app pode exibir e não cria sessão

### Requirement: E-mail e senha não entram
O sistema MUST NOT abrir sessão com e-mail e senha.

#### Scenario: Pedido antigo de cadastro ou entrada
- **WHEN** o cliente chama a entrada antiga só com e-mail e senha
- **THEN** o sistema não cria sessão e não devolve token

### Requirement: Rota protegida sem sessão
O sistema MUST recusar perfil, provas e match sem um token válido.

#### Scenario: Token ausente ou inválido
- **WHEN** uma rota de perfil, prova ou match recebe token ausente ou inválido
- **THEN** o sistema responde 401 com a mensagem "Não autorizado"

#### Scenario: App recebe 401
- **WHEN** o app recebe 401 numa chamada autenticada
- **THEN** o app encerra a sessão local e volta para a tela inicial
