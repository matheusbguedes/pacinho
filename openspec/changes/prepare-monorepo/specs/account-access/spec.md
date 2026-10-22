# Spec Delta

## Purpose

Permite que uma pessoa crie uma conta no Pacinho e mantenha uma sessão autenticada para acessar perfil, provas e match.

## ADDED Requirements

### Requirement: Cadastro cria sessão
O sistema MUST criar uma conta com papel de usuário comum e devolver um token de sessão junto com o perfil, sem a senha.

#### Scenario: Cadastro válido
- **WHEN** uma pessoa envia nome com pelo menos 2 caracteres, e-mail válido, senha com pelo menos 6 caracteres e telefone com 11 caracteres
- **THEN** o sistema responde 201 com `token` e `user`, o `user` não contém senha, e o papel é usuário comum

#### Scenario: E-mail já cadastrado
- **WHEN** o e-mail enviado já pertence a uma conta
- **THEN** o sistema responde 409 com a mensagem "Email já cadastrado" e não cria outra conta

#### Scenario: Corpo inválido
- **WHEN** o corpo do cadastro não satisfaz as regras de nome, e-mail, senha ou telefone
- **THEN** o sistema responde 400 com uma mensagem que o cliente pode exibir

### Requirement: Entrada com e-mail e senha
O sistema MUST autenticar por e-mail e senha e devolver a mesma forma de sessão do cadastro, sem revelar qual dos dois campos falhou.

#### Scenario: Credenciais corretas
- **WHEN** o e-mail existe e a senha confere
- **THEN** o sistema responde 200 com `token` e `user`, e o `user` não contém senha

#### Scenario: Credenciais incorretas
- **WHEN** o e-mail não existe ou a senha não confere
- **THEN** o sistema responde 400 com a mensagem "Email ou senha incorretos."

### Requirement: Rotas protegidas exigem sessão
O sistema MUST recusar perfil, provas e match quando o token está ausente ou é inválido, com a mensagem que o cliente já trata como fim de sessão.

#### Scenario: Token ausente ou inválido
- **WHEN** uma rota de perfil, prova ou match recebe um token ausente ou inválido
- **THEN** o sistema responde 401 com a mensagem "Não autorizado"

#### Scenario: Cliente recebe 401
- **WHEN** o app recebe 401 em uma chamada autenticada
- **THEN** o app encerra a sessão local e volta para a entrada
