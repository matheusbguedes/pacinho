# Spec Delta

## Purpose

Mostra as próximas provas para quem corre, registra quem vai e aponta a compra do ingresso para um site externo.

## ADDED Requirements

### Requirement: Lista só provas que ainda vão acontecer
O sistema MUST listar provas futuras para a pessoa autenticada, com busca por nome e filtro por dia, e MUST indicar se ela já confirmou presença.

#### Scenario: Lista padrão
- **WHEN** a pessoa autenticada lista provas sem filtro
- **THEN** o sistema responde 200 só com provas cujo início é agora ou depois, ordenadas da mais próxima para a mais distante, cada item com `ticket_url`, contagem de presenças e `attending`

#### Scenario: Busca e dia
- **WHEN** a pessoa envia um texto de busca e/ou uma data `YYYY-MM-DD`
- **THEN** o sistema filtra o nome sem diferenciar maiúsculas e restringe ao dia pedido, e ainda assim exclui prova que já começou

### Requirement: Detalhe mostra quem confirmou
O sistema MUST devolver a prova e a lista de presenças, do mais recente para o mais antigo.

#### Scenario: Prova existente
- **WHEN** a pessoa autenticada abre uma prova que existe
- **THEN** o sistema responde 200 com os dados da prova, `attending` e cada presença com id, data e o recorte público do corredor (id, nome, idade, cidade, objetivo e ritmo)

#### Scenario: Prova inexistente
- **WHEN** o id não corresponde a uma prova
- **THEN** o sistema responde 404 com a mensagem "Evento não encontrado"

### Requirement: Presença é idempotente
O sistema MUST confirmar e remover a presença da própria sessão sem duplicar o vínculo.

#### Scenario: Confirmar presença
- **WHEN** a pessoa autenticada confirma presença numa prova que existe, inclusive se já tinha confirmado
- **THEN** o sistema responde 200 com um único vínculo daquela pessoa com aquela prova

#### Scenario: Confirmar prova inexistente
- **WHEN** a pessoa confirma presença num id que não existe
- **THEN** o sistema responde 404 com a mensagem "Evento não encontrado"

#### Scenario: Remover presença
- **WHEN** a pessoa autenticada remove a própria presença, mesmo que não tivesse confirmado
- **THEN** o sistema responde 200 com a mensagem "Presença removida"

### Requirement: Ingresso fica fora do app
O sistema MUST tratar o ingresso como um link externo e MUST permitir criar prova apenas para administrador.

#### Scenario: Administrador cria prova
- **WHEN** um administrador envia nome, início, local e, se quiser, distância, organizador e `ticket_url`
- **THEN** o sistema responde 201 com a prova, contagem de presenças zerada e `attending` falso

#### Scenario: Pessoa comum cria prova
- **WHEN** uma sessão que não é administrador tenta criar prova
- **THEN** o sistema responde 403 com a mensagem "Não autorizado" e não cria a prova

#### Scenario: Link de ingresso
- **WHEN** a prova tem `ticket_url`
- **THEN** o valor é uma URL externa e o sistema não cobra nem emite ingresso
