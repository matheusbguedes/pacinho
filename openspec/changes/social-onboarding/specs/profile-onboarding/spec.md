# Spec Delta

## Purpose

Obriga o cadastro do perfil que o card de match mostra e, ao terminar, abre o deck em que a pessoa dá like ou deslike.

## ADDED Requirements

### Requirement: Perfil incompleto fica no cadastro
O app MUST manter a pessoa no cadastro inicial enquanto faltar qualquer dado do card, e MUST impedir o deck nesse estado.

#### Scenario: Conta nova
- **WHEN** a sessão abre e falta nome, idade, gênero, cidade, região, objetivo, ritmo, distância, bio ou foto
- **THEN** o app mostra só o cadastro inicial, com o nome preenchido quando o provedor enviou um

#### Scenario: Tentativa de usar o deck incompleto
- **WHEN** a sessão pede o deck ou envia like ou deslike com o perfil incompleto
- **THEN** o sistema recusa e o app continua no cadastro

### Requirement: Cadastro pede o que o card mostra
O sistema MUST gravar nome, idade, gênero, cidade, região, objetivo, ritmo, distância, bio e pelo menos uma foto, e MUST recusar valor fora das regras já usadas no perfil.

#### Scenario: Cadastro completo
- **WHEN** a pessoa envia nome com pelo menos 2 caracteres, idade de 18 a 100, gênero `WOMAN`, `MAN`, `NON_BINARY`, `OTHER` ou `PREFER_NOT_TO_SAY`, cidade, região, objetivo `DATING`, `FRIENDSHIP` ou `TRAINING`, ritmo, distância positiva, bio de até 500 caracteres e pelo menos uma foto
- **THEN** o sistema guarda o perfil, a foto fica disponível como URL no card, e a resposta não contém senha

#### Scenario: Dado inválido
- **WHEN** a idade está fora de 18 a 100, o gênero ou o objetivo não é aceito, ou a bio passa de 500 caracteres
- **THEN** o sistema responde 400 e não marca o perfil como completo

### Requirement: Perfil completo abre o deck
O app MUST abrir o deck de like e deslike quando o perfil fica completo, e MUST pular o cadastro nas próximas aberturas.

#### Scenario: Conclusão do cadastro
- **WHEN** o perfil passa a ter todos os dados do card, inclusive uma foto
- **THEN** o app abre a aba Gente, onde like continua `LIKE` e deslike continua `PASS`

#### Scenario: Volta de quem já completou
- **WHEN** uma sessão com perfil completo abre o app
- **THEN** o app abre a aba Gente e não mostra o cadastro inicial
