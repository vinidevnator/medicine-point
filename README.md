# Medicine Point

> Marketplace hiperlocal de medicamentos que conecta consumidores a farmácias independentes próximas.

O **Medicine Point** permite que consumidores encontrem medicamentos disponíveis por CEP, comparem preços e escolham entre retirada na loja, motoentrega ou entrega pelo centro de distribuição. Para farmácias, é uma vitrine e ferramenta de gestão de pedidos leve, com catálogo, estoque, preços e relatórios.

---

## Tecnologias

- [Next.js](https://nextjs.org) **16.2.9** — App Router (sem diretório `pages/`)
- [React](https://react.dev) **19.2.4**
- [TypeScript](https://www.typescriptlang.org) **5** (strict, `moduleResolution: "bundler"`)
- [Tailwind CSS](https://tailwindcss.com) **v4** com `@tailwindcss/postcss`
- [Drizzle ORM](https://orm.drizzle.team) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
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

---

# Medicine Point (English)

> A hyperlocal medicine marketplace connecting consumers to nearby independent pharmacies.

**Medicine Point** lets consumers find available medicines by ZIP code, compare prices, and choose between in-store pickup, motorcycle delivery, or distribution-center delivery. For pharmacies, it is a lightweight storefront and order-management tool with catalog, stock, pricing, and reports.

---

## Tech Stack

- [Next.js](https://nextjs.org) **16.2.9** — App Router (no `pages/` directory)
- [React](https://react.dev) **19.2.4**
- [TypeScript](https://www.typescriptlang.org) **5** (strict, `moduleResolution: "bundler"`)
- [Tailwind CSS](https://tailwindcss.com) **v4** with `@tailwindcss/postcss`
- [Drizzle ORM](https://orm.drizzle.team) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
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
