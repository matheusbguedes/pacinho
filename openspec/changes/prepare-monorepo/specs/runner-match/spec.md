# Spec Delta

## Purpose

Aproxima corredores por like mútuo, seja no deck geral ou entre quem confirmou presença na mesma prova.

## ADDED Requirements

### Requirement: Deck exclui quem já recebeu ação
O sistema MUST listar até 50 corredores ainda sem ação da sessão, do cadastro mais recente para o mais antigo, e MUST aceitar restringir a uma prova.

#### Scenario: Deck geral
- **WHEN** a pessoa autenticada pede pessoas sem `event_id`
- **THEN** o sistema responde 200 sem a própria pessoa e sem quem já recebeu like ou pass dela, cada item no recorte público com mídia ordenada

#### Scenario: Deck da prova
- **WHEN** a pessoa envia `event_id` de uma prova
- **THEN** o sistema devolve só quem confirmou presença nessa prova e ainda não recebeu ação dela

#### Scenario: Ação anterior vale para toda prova
- **WHEN** a pessoa já deu like ou pass em alguém fora de uma prova
- **THEN** essa pessoa também sai do deck dessa prova, porque a ação é do par e não da prova

### Requirement: Like ou pass é um por par
O sistema MUST gravar uma ação `LIKE` ou `PASS` por par ordenado de pessoas e MUST substituir a ação anterior desse par.

#### Scenario: Ação sobre outra pessoa
- **WHEN** a pessoa autenticada envia `to_id` e `LIKE` ou `PASS`, com `event_id` opcional
- **THEN** o sistema responde 200 com o id da ação, a ação gravada, `is_match` e `matched_user`

#### Scenario: Ação sobre si
- **WHEN** `to_id` é a própria sessão
- **THEN** o sistema responde 400 com a mensagem "Não é possível agir sobre si mesmo"

#### Scenario: Pessoa inexistente
- **WHEN** `to_id` não existe
- **THEN** o sistema responde 404 com a mensagem "Usuário não encontrado"

#### Scenario: Troca de ação
- **WHEN** a pessoa envia uma nova ação para um par que já tem ação
- **THEN** o sistema substitui a ação e o `event_id` desse par, sem criar um segundo registro

### Requirement: Match exige like dos dois lados
O sistema MUST marcar match só quando a ação atual é `LIKE` e a outra pessoa já deu `LIKE` de volta.

#### Scenario: Like recíproco
- **WHEN** a pessoa dá `LIKE` em quem já deu `LIKE` nela
- **THEN** `is_match` é verdadeiro e `matched_user` traz o recorte público de quem recebeu o like

#### Scenario: Like sem resposta ou pass
- **WHEN** a ação é `PASS`, ou é `LIKE` sem like de volta
- **THEN** `is_match` é falso e `matched_user` é nulo

### Requirement: Lista de matches mútuos
O sistema MUST listar só pares em que os dois lados deram `LIKE`.

#### Scenario: Há matches
- **WHEN** a pessoa autenticada lista matches e existe pelo menos um like recíproco
- **THEN** o sistema responde 200 com `matched_at` e o usuário público, do match mais recente para o mais antigo

#### Scenario: Não há matches
- **WHEN** a pessoa não tem like recíproco
- **THEN** o sistema responde 200 com uma lista vazia
