# Spec Delta

## Purpose

Descreve o corredor para outras pessoas: objetivo social, ritmo, distância usual e onde corre, sem expor credenciais.

## ADDED Requirements

### Requirement: Leitura do próprio perfil
O sistema MUST devolver o perfil da sessão atual, inclusive campos ainda vazios, e MUST omitir a senha.

#### Scenario: Sessão válida
- **WHEN** a pessoa autenticada pede o próprio perfil
- **THEN** o sistema responde 200 com id, nome, e-mail, telefone, papel, idade, gênero, cidade, região, bio, objetivo, ritmo, distância e data de criação, sem senha

#### Scenario: Conta não existe mais
- **WHEN** o token aponta para uma conta que não está mais no sistema
- **THEN** o sistema responde 404 com a mensagem "Usuário não encontrado"

### Requirement: Atualização do perfil de corredor
O sistema MUST aceitar atualização parcial do perfil e MUST limitar idade, bio, telefone, gênero e objetivo aos valores já aceitos hoje.

#### Scenario: Atualização parcial válida
- **WHEN** a pessoa autenticada envia um subconjunto de nome, telefone, idade, gênero, cidade, região, bio, objetivo, ritmo e distância
- **THEN** o sistema responde 200 com o perfil atualizado e sem senha, e os campos omitidos permanecem como estavam

#### Scenario: Objetivo social
- **WHEN** a pessoa define o objetivo
- **THEN** o sistema aceita apenas `DATING`, `FRIENDSHIP` ou `TRAINING`, ou ausência de objetivo

#### Scenario: Gênero
- **WHEN** a pessoa define o gênero
- **THEN** o sistema aceita apenas `WOMAN`, `MAN`, `NON_BINARY`, `OTHER` ou `PREFER_NOT_TO_SAY`, ou ausência de gênero

#### Scenario: Idade ou bio fora do limite
- **WHEN** a idade está fora de 18 a 100, a bio passa de 500 caracteres, ou o telefone não tem 11 caracteres
- **THEN** o sistema responde 400 e não grava a alteração

### Requirement: Perfil público no match
O sistema MUST mostrar a outras pessoas só o recorte público do corredor.

#### Scenario: Outra pessoa vê o corredor
- **WHEN** o perfil aparece no deck, num match ou na lista de presença
- **THEN** a resposta inclui nome, idade, cidade e os campos públicos daquele contexto, e exclui senha, e-mail e telefone
