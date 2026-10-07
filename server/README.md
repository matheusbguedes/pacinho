# Pacinho Server

API do Pacinho — app social para quem corre em São Paulo.

## Stack

- Fastify
- Prisma + PostgreSQL
- JWT + bcrypt
- Zod

## Pré-requisitos

- Docker e Docker Compose
- Node.js LTS
- NPM

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie um `.env`:

```env
NODE_ENV=development
SERVER_PORT=3333
SERVER_HOST=0.0.0.0
SERVER_SECRET=troque-este-segredo

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pacinho?schema=public
```

## Desenvolvimento

```bash
docker compose up -d
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Health check: `GET /health`

## Rotas principais

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/signup` | Criar conta |
| POST | `/signin` | Login |
| GET/PUT | `/users/me` | Perfil do usuário logado |
| GET | `/events` | Listar eventos |
| GET | `/events/:id` | Detalhe + quem confirmou |
| POST/DELETE | `/events/:id/attend` | Confirmar / remover presença |
| GET | `/matches/people` | Pessoas para curtir (`?event_id=`) |
| POST | `/matches` | LIKE ou PASS |
| GET | `/matches` | Matches mútuos |
