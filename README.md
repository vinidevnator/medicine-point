# Medicine Point

> Plataforma para digitalização e gestão do estoque de farmácias independentes, conectando seus medicamentos a consumidores da região por meio de um marketplace hiperlocal e de uma rede de pontos de coleta.

O Medicine Point foi concebido com foco nas farmácias. A plataforma permite que estabelecimentos se cadastrem, registrem seu estoque de medicamentos, disponibilidade, pedidos e acompanhem relatórios de desempenho. A partir desse cadastro, os produtos passam a compor um marketplace hiperlocal, permitindo que consumidores encontrem medicamentos disponíveis por CEP, comparem preços e escolham entre retirada na farmácia, motoentrega ou entrega pelo centro de distribuição.

---

## Tecnologias

- [Next.js](https://nextjs.org) **16.2.9** — App Router (sem diretório `pages/`)
- [React](https://react.dev) **19.2.4**
- [TypeScript](https://www.typescriptlang.org) **5** (strict, `moduleResolution: "bundler"`)
- [Tailwind CSS](https://tailwindcss.com) **v4** com `@tailwindcss/postcss`
- [Drizzle ORM](https://orm.drizzle.team) + [libSQL/Turso](https://turso.tech) (arquivo SQLite local em desenvolvimento)
- Autenticação com [jose](https://github.com/panva/jose) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- Validação com [Zod](https://zod.dev)
- Ícones com [Lucide React](https://lucide.dev)
- Gráficos com [Recharts](https://recharts.org)
- Fontes: Inter + Geist Mono via `next/font/google`

---

## Pré-requisitos

- [Node.js](https://nodejs.org) (versão recomendada: 20 ou superior)
- [npm](https://www.npmjs.com) (já vem com o Node)

---

## Como começar

1. **Instale as dependências:**

   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**

   ```bash
   cp .env.example .env.local
   ```

   Abra `.env.local` e adicione sua chave da OpenAI:

   ```env
   OPENAI_API_KEY=sk-...
   ```

   As demais variáveis já possuem valores padrão razoáveis para desenvolvimento local.

3. **Execute o bootstrap do banco de dados:**

   ```bash
   npm run predev
   ```

   Esse comando executa `scripts/bootstrap.ts`, que gera o `AUTH_SECRET` automaticamente (se ainda não existir) e carrega o seed inicial do banco.

4. **Inicie o servidor de desenvolvimento (forma preferida):**

   ```bash
   npm run dev:https
   ```

   O projeto estará disponível em `https://localhost:3000`.

   > Se preferir HTTP, use `npm run dev` e acesse `http://localhost:3000`.

---

## Scripts disponíveis

| Script | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento em HTTP |
| `npm run dev:https` | Inicia o servidor de desenvolvimento em HTTPS (recomendado) |
| `npm run build` | Gera a build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |
| `npm run db:generate` | Gera migrations do Drizzle |
| `npm run db:migrate` | Aplica migrations do Drizzle |
| `npm run db:push` | Sincroniza o schema com o banco |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run db:seed` | Executa o seed do banco |

> Para verificação de tipos, execute `npx tsc --noEmit`.

---

## Estrutura do projeto

- `app/` — raiz da aplicação Next.js (App Router)
- `db/` — schema, migrations, seed e configuração do Drizzle ORM
- `lib/` — utilitários e helpers compartilhados
- `components/` — componentes React reutilizáveis
- `services/` — lógica de domínio (ex.: assistente de entrega)
- `scripts/` — scripts auxiliares (bootstrap)
- Não há diretório `src/`; o alias `@/*` resolve para a raiz do projeto.

---

## Deploy

O projeto pode ser implantado na [Vercel](https://vercel.com) ou em qualquer ambiente compatível com Next.js. Consulte a [documentação de deploy do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.

Como o filesystem serverless da Vercel é efêmero, o banco em arquivo local não persiste em produção. Configure um banco [Turso](https://turso.tech) e defina as variáveis de ambiente no projeto da Vercel:

- `TURSO_DATABASE_URL` — URL `libsql://...` do banco
- `TURSO_AUTH_TOKEN` — token de acesso
- `AUTH_SECRET` — segredo de assinatura de sessão (>=32 caracteres; `openssl rand -base64 32`)
- `OPENAI_API_KEY` — para o assistente de entrega

O `prebuild` aplica as migrations e o seed idempotente contra o banco configurado durante o build.

---

# Medicine Point (English)

> Platform for digitizing and managing the inventory of independent pharmacies, connecting their medicines with local consumers through a hyperlocal marketplace and a network of collection points.

Medicine Point was designed with pharmacies as its primary focus. The platform enables pharmacies to register, manage their medicine inventory, track product availability, process orders, and monitor performance through reports and analytics. Once their inventory is registered, products become available in a hyperlocal marketplace, allowing consumers to search for medicines by ZIP code, compare prices, and choose between in-store pickup, motorcycle delivery, or fulfillment through a distribution center.

---

## Tech Stack

- [Next.js](https://nextjs.org) **16.2.9** — App Router (no `pages/` directory)
- [React](https://react.dev) **19.2.4**
- [TypeScript](https://www.typescriptlang.org) **5** (strict, `moduleResolution: "bundler"`)
- [Tailwind CSS](https://tailwindcss.com) **v4** with `@tailwindcss/postcss`
- [Drizzle ORM](https://orm.drizzle.team) + [libSQL/Turso](https://turso.tech) (local SQLite file in development)
- Auth with [jose](https://github.com/panva/jose) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- Validation with [Zod](https://zod.dev)
- Icons with [Lucide React](https://lucide.dev)
- Charts with [Recharts](https://recharts.org)
- Fonts: Inter + Geist Mono via `next/font/google`

---

## Prerequisites

- [Node.js](https://nodejs.org) (recommended: 20 or newer)
- [npm](https://www.npmjs.com) (comes with Node)

---

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and add your OpenAI key:

   ```env
   OPENAI_API_KEY=sk-...
   ```

   The remaining variables have sensible defaults for local development.

3. **Run the database bootstrap:**

   ```bash
   npm run predev
   ```

   This runs `scripts/bootstrap.ts`, which auto-generates `AUTH_SECRET` (if missing) and loads the initial database seed.

4. **Start the development server (preferred):**

   ```bash
   npm run dev:https
   ```

   The app will be available at `https://localhost:3000`.

   > If you prefer HTTP, run `npm run dev` and open `http://localhost:3000`.

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the HTTP development server |
| `npm run dev:https` | Start the HTTPS development server (recommended) |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:push` | Sync schema to the database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Run the database seed |

> To typecheck, run `npx tsc --noEmit`.

---

## Project Structure

- `app/` — Next.js application root (App Router)
- `db/` — Drizzle ORM schema, migrations, seed, and config
- `lib/` — shared utilities and helpers
- `components/` — reusable React components
- `services/` — domain logic (e.g., delivery advisor)
- `scripts/` — auxiliary scripts (bootstrap)
- There is no `src/` directory; the `@/*` alias resolves to the project root.

---

## Deploy

This project can be deployed on [Vercel](https://vercel.com) or any Next.js-compatible hosting. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.

Because Vercel's serverless filesystem is ephemeral, the local file database does not persist in production. Provision a [Turso](https://turso.tech) database and set these environment variables on the Vercel project:

- `TURSO_DATABASE_URL` — the database's `libsql://...` URL
- `TURSO_AUTH_TOKEN` — access token
- `AUTH_SECRET` — session signing secret (>=32 chars; `openssl rand -base64 32`)
- `OPENAI_API_KEY` — for the delivery advisor

The `prebuild` step applies migrations and the idempotent seed against the configured database during the build.
