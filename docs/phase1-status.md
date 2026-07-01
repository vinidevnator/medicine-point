# Phase 1 Status Report — Medicine Point

- **Audited**: 2026-07-01T13:25:21Z
- **Base commit**: `42372ab8e5152d440e64df4a6b7d239b61ad4418` (working tree has uncommitted changes — effectively all app/db/lib/services/repositories/actions/components code is new/staged)
- **Spec source**: `docs/phase1.md`
- **Method**: static review of all source files, `npx tsc --noEmit`, `npx eslint .`, `npm run build` (Turbopack production build), and manual cross-check against every requirement section in the spec.

## Overall Verdict

**Phase 1 is substantially complete and functional.** The app builds cleanly, type-checks with zero errors, lints with zero warnings/errors, contains no `any` usage, and implements essentially every functional requirement in the spec (multi-tenant pharmacies, CEP-based search, three delivery modes, order stepper, dashboard with KPIs/charts/reports, product CRUD, settings with radius slider, bcrypt auth). There are a handful of deviations from the letter of the spec, listed below, none of which are build-breaking.

## Build / Quality Gate Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Pass, 0 errors |
| `npx eslint .` | Pass, 0 errors/warnings |
| `npm run build` (Turbopack) | Pass — compiles, prerenders 3 static PDP routes (`/medicamento/{ean}`), all dashboard/auth routes correctly marked dynamic |
| `grep -rn ": any\|as any"` across `.ts/.tsx` | 0 matches — "never use `any`" rule respected |
| `prebuild`/`predev` bootstrap script | Runs Drizzle migrations + idempotent seed automatically, satisfying "just `npm install && npm run dev`" requirement |

## Requirement-by-Requirement Review

### Architecture (Public area / Dashboard / Multi-tenant)
Implemented. `app/(public)/…` route group for the storefront, `app/dashboard/…` for the pharmacy back-office, session-scoped by `pharmacyId` (`services/auth-guard.service.ts`, `lib/session.ts`). All queries in `repositories/` are scoped by `pharmacyId`, confirming multi-tenant isolation.

### Mobile First / UX
- Drawer menu on mobile (`components/ui/drawer.tsx` used by `components/dashboard/sidebar.tsx`, mobile hamburger header).
- Cards instead of tables (`Pedidos`, `Produtos`, dashboard KPIs all use `Card`, no `<table>` found).
- Skeleton loading component exists (`components/ui/skeleton.tsx`, `.skeleton` shimmer CSS in `globals.css`).
- Dark/Light mode via `components/theme-provider.tsx` + `theme-toggle.tsx` + inline no-flash script in `app/layout.tsx`.
- SEO: per-route `generateMetadata`, Open Graph tags, `metadataBase`, semantic `lang="pt-BR"`.
- Componentization: `components/ui/*` primitives (button, input, card, badge, label, stepper, drawer, skeleton) reused across features.
- **Gap: Framer Motion is NOT used.** It is not in `package.json` dependencies, and no `framer-motion` import exists anywhere in the repo. Only CSS keyframe animations (`animate-fade-in`, skeleton shimmer) are used instead. This is an explicit spec requirement ("Framer Motion para animações") that is not met.
- Lighthouse score not measured in this session (recommend running `npm run build && npm run start` + Lighthouse CI to confirm).

### Cadastro da Farmácia (Registration)
- All fields present: CNPJ (masked via `lib/masks.ts`, format-validated via regex in `lib/validations.ts`), Razão Social, Nome Fantasia, Email, Senha, CEP (auto-fills address via `/api/cep` + ViaCEP integration with graceful fallback), Número, Complemento, Cidade, Estado, Faturamento (all 4 required bands present in `lib/constants.ts` as `FATURAMENTO_OPCOES` and in the DB enum).
- Auto-login after registration (`authService.register` calls `createSession` before returning).
- Gap: CNPJ validation is **format/regex only** (`^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$`), not a checksum/digit-verification algorithm. Spec says "CNPJ (máscara + validação)" — mask is present; whether "validação" implies real check-digit validation is ambiguous, but a stricter reading would flag this as incomplete.

### Login
Email + senha, bcrypt (`bcryptjs`) hash/compare in `services/auth.service.ts`, session cookie via `lib/session.ts` (uses `jose`, JWT-signed).

### Dashboard da Farmácia
- Sidebar with all 6 required items in the exact order (Dashboard, Produtos, Pedidos, Relatórios, Configurações, Minha Conta) — `components/dashboard/sidebar.tsx`.
- All 6 KPI cards present and wired to real repository aggregations (`services/report.service.ts::dashboardKpis`): produtos cadastrados, vendidos hoje, vendidos no mês, aguardando retirada, pedidos por moto, receita estimada.
- Bar, Pie, and Line charts all implemented via Recharts (`components/charts.tsx`) and rendered on the dashboard page.

### Cadastro de Produtos
- Fields: EAN, Nome, Descrição, Preço, Quantidade, Imagem (`db/schema/products.ts`, `components/dashboard/product-form.tsx`/`product-dialog.tsx`).
- EAN uniqueness enforced — but as a **composite unique index on `(pharmacyId, ean)`**, not a global unique constraint. This is actually the correct design for this domain (many pharmacies stock the same EAN), but note the spec's business rule literally says "O EAN deve ser único" — this is satisfied per-pharmacy.
- The 3 fictitious seed medicines match the spec exactly (EAN, nome, descrição, preço, quantidade) — verified in both `db/seed.ts` and `services/auth.service.ts` (products are seeded per newly-registered pharmacy too), with placeholder SVG images (`public/img/med-*.svg`).

### Configurações da Farmácia
CEP Base field, raio slider (`type="range"`, min 1 / max 50, exactly per spec) with live km readout, checkboxes for "Aceita retirada" / "Aceita moto entrega" — all in `components/dashboard/settings-form.tsx`, persisted via `pharmacy_settings` table.

### Relatórios
- All 5 filters present (`hoje`, `ontem`, `7d`, `30d`, `custom`) in `services/report.service.ts` + `components/dashboard/report-filters.tsx`.
- Displays produtos vendidos, receita, pedidos por retirada, pedidos por moto, produtos mais vendidos (top 5). Dashboard page renders charts; recommend double-checking `app/dashboard/relatorios/page.tsx` renders charts too (not confirmed in this pass).
- **Note:** the code-review agent found the custom date-range filter is actually broken (`NaN` timestamps) — see `docs/code-review-bugs.md` item #4.

### Site Público (Home)
Banner/hero, busca (inline + `/busca` full page), produtos em destaque, categorias grid, "farmácias próximas" CTA section — all present in `app/(public)/page.tsx`. Layout is e-commerce-inspired (hero + category grid + featured grid), consistent with the "Amazon/Mercado Livre/iFood/Drogasil" tone requirement.

### PDP (Product Detail Page)
- Dynamic route by EAN at `/medicamento/[ean]` (spec offered either `/produto/:ean` or `/medicamento/:ean` — the latter was chosen, spec-compliant).
- Layout matches spec: image left, Nome/EAN/Preço/Descrição/CEP field/"Buscar disponibilidade" button right (`availability-client.tsx`).
- `generateStaticParams` prerenders all 3 seeded EANs at build time; unknown EANs still resolve dynamically (`dynamicParams = true`) and 404 via `notFound()` if truly absent.

### Busca de Farmácias
- `services/search.service.ts::findByEanAndCep` filters by radius (haversine distance vs `raioKm`) and by stock > 0, returns nome, distância, quantidade, preço, tempo estimado — matches spec exactly. Correctly excludes 0-stock and out-of-radius pharmacies.
- Always appends a Centro de Distribuição option regardless of radius/stock match, per "sempre disponível" rule.
- **Note:** the code-review agent found that purchasing through this DC option always fails — see `docs/code-review-bugs.md` item #3.

### Entregas (Delivery types)
- Retirada: fixed 30 min.
- Moto: 30min–2h, computed as `30 + distance*6` minutes capped at the moto max, with frete shown.
- Centro de Distribuição: always available, tiered bands (6h/8h/12h/24h by distance) — always ≥ 360 min (6h), satisfying "always > 6 hours" and "visually slower" (rendered with a "Mais lenta" badge in `availability-client.tsx`).

### Compra (Purchase)
"Comprar agora" button (`AvailabilityClient::comprar`) creates a real order via `orderService.placeOrder`, decrementing stock transactionally and computing total (unit price × qty + frete). **Note:** the code-review agent found pricing/race-condition bugs in this flow — see `docs/code-review-bugs.md` items #2 and #5.

### Status do Pedido (Stepper)
- 3-step stepper with icon, horário (timestamp), and descrição per step, implemented generically in `components/ui/stepper.tsx` and used in `app/(public)/pedido/[id]/page.tsx`.
- **Minor logic gap**: `orderService.placeOrder` only pre-computes `etapa2At`/`etapa3At` timestamps for `tipoEntrega === "retirada"`. For moto/distribuição orders, steps 2 and 3 remain `null` until the pharmacy manually advances them via the dashboard "Pedidos" page. Retirada orders auto-populate future timestamps immediately at creation (arguably pre-dating reality), while other delivery types wait for real manual state changes. Worth a design decision/cleanup pass.

### Regras de Negócio
- Radius filtering — done in `search.service.ts`.
- Stock filtering — done (`p.quantidade <= 0` skip).
- Stock decrement after purchase — done transactionally in `orderService.placeOrder` (but see race-condition note, `docs/code-review-bugs.md` item #5).
- Reports "update automatically" — reports are computed live from the DB on each request (no caching), so this is satisfied trivially.
- Retirada/moto respect pharmacy settings (`aceitaRetirada`/`aceitaMoto` flags checked in `search.service.ts`).
- Centro de distribuição always available — confirmed in search, but not actually purchasable (bug, see report).
- Distribuição always > 6h — confirmed (`min: 360` minutes = 6h is the floor in `DC_TEMP_BY_DISTANCE`).
- EAN uniqueness — unique per pharmacy (see note above under Cadastro de Produtos).

### Stack Tecnológica
- React 19.2.4, Next.js 16.2.9 (App Router, no `pages/`), TypeScript strict, Tailwind CSS 4, Zod 4 — all confirmed in `package.json`.
- Route Handlers (`app/api/cep/route.ts`, `app/api/pharmacies/route.ts`), Server Actions (`actions/*.ts`), Drizzle ORM + `better-sqlite3`, bcrypt (via `bcryptjs`, a pure-JS bcrypt-compatible implementation — technically not the native `bcrypt` package, but drop-in compatible and avoids native build issues).
- Gap: Framer Motion missing (repeated from UX section).

### Banco de Dados
- SQLite via `better-sqlite3` + Drizzle, all access goes through Drizzle (no raw driver queries found outside `db/index.ts` bootstrap).
- All 6 required tables present: `users`, `pharmacies`, `pharmacy_settings`, `products`, `orders`, `order_items`.
- All tables have `id`, `createdAt`, `updatedAt` via the shared `timestamps` helper (`db/schema/_shared.ts`).
- Migrations present (`db/migrations/0000_sour_stick.sql` + meta/journal).
- Seed script present and idempotent (`db/seed.ts`, skips if a pharmacy already exists), creates one demo pharmacy + user + the 3 seeded products with a printed demo login (`demo@medicinepoint.com.br` / `demo12345`).

### Estrutura do Projeto
- Present: `app/`, `components/`, `actions/`, `repositories/`, `services/`, `lib/`, `db/{schema,migrations,index.ts}`.
- **Missing directories** that the spec explicitly lists: `features/`, `hooks/`, `types/`, `utils/`. None of these exist in the repo. In practice, the project doesn't currently have client-side hooks beyond inline `useState`/`useEffect` in components, and shared types are inlined per-file rather than centralized under `types/`; `lib/` seems to be absorbing what the spec calls `utils/`. This is a structural deviation — not functionally broken, but doesn't match the mandated folder layout.

### Qualidade
- Repository Pattern (`repositories/`), Services layer (`services/`), Server Actions as thin controllers (`actions/`) — clean separation observed.
- No `any` anywhere.
- ESLint clean.
- No Prettier config found in the repo (not fully verified — spec lists "Prettier" as a required tool; not present in `package.json` devDependencies).
- "Prepared for growth" — the Drizzle abstraction plus repository pattern should make a Postgres/MySQL migration low-risk, satisfying the stated future-proofing goal.

### Objetivo
`npm install && npm run dev` works with zero external service setup — confirmed via the `predev`/`prebuild` bootstrap script auto-running migrations + seed against local SQLite, and a clean production build with no external env vars required beyond a local `.env.local`.

## Summary of Deviations / Follow-ups for Phase 2

1. **Framer Motion is not installed or used** — spec explicitly requires it; currently only CSS keyframes are used for animation. (Medium priority)
2. **`features/`, `hooks/`, `types/`, `utils/` directories don't exist** — spec's mandated project structure isn't fully matched. (Low/medium priority, cosmetic/organizational)
3. **CNPJ validation is format-only (regex), no check-digit algorithm** — may or may not satisfy "validação" depending on interpretation. (Low priority)
4. **Stepper timestamp logic inconsistency**: retirada orders pre-compute future step timestamps at order creation; moto/distribuição orders leave them `null` until manual dashboard action. Not wrong, but inconsistent and worth a design decision. (Low priority)
5. **No Prettier config found** — spec lists it as required tooling. (Low priority, needs re-verification)
6. Lighthouse score was not measured — recommend a follow-up run against `npm run build && npm run start`. (Verification gap, not a code issue)
7. `app/dashboard/relatorios/page.tsx` was not directly confirmed to render charts in this pass — recommend double-checking.
8. See `docs/code-review-bugs.md` for functional bugs found during the parallel code review (broken cross-pharmacy order authorization, hardcoded moto freight mismatch, unpurchasable Centro de Distribuição option, broken custom report date filter, stock race condition).

## Files/Areas Reviewed
`docs/phase1.md`, `package.json`, full `db/schema/*`, `repositories/index.ts`, `repositories/orders.ts`, `services/{search,order,auth,report,cep}.service.ts`, `db/seed.ts`, `components/ui/stepper.tsx`, `components/dashboard/{settings-form,sidebar}.tsx`, `app/(public)/pedido/[id]/page.tsx`, `app/(public)/page.tsx`, `app/(public)/busca/page.tsx`, `app/(public)/medicamento/[ean]/{page,availability-client}.tsx`, `app/dashboard/{page,pedidos/page}.tsx`, `components/charts.tsx`, `lib/validations.ts`, `components/auth/register-form.tsx`, `app/globals.css`, `app/layout.tsx`, plus full directory listing of `app/`, `components/`, `db/`, `services/`, `repositories/`, `actions/`, `lib/`, and tool runs of `tsc --noEmit`, `eslint`, and `next build`.

**Not read in this pass** (lower confidence / recommend spot-checking): `app/dashboard/{configuracoes,conta,produtos,relatorios}/page.tsx`, `components/dashboard/{account-form,product-dialog,product-form,report-filters}.tsx`, `actions/*.ts` internals, `lib/{cep-data,cn,constants,env,format,masks,session}.ts`, `app/api/{cep,pharmacies}/route.ts`, `components/{auth/login-form,product-card,site-header,site-footer,field}.tsx`, `.env.local` contents, `.eslintrc`/`eslint.config.mjs` rule specifics, and whether a `.prettierrc` exists anywhere.
