# Refactor Map & Bug Hunt — medicine-point

Stack: Next.js 16.2.9 (App Router) / React 19.2.4 / TypeScript strict. Read-only catalogue — **no source files were changed**. Every finding was verified against the actual code.

## Guidance applied

Framework-convention checks used the version-matched Next.js 16.2.9 docs bundled in `node_modules/next/dist/docs/` (source of truth per `AGENTS.md`); the Context7 MCP is network-gated and unavailable to the read-only audit agent.

- `proxy.md` + `version-16.md`: `middleware` is deprecated and renamed to `proxy` (`export function proxy`) in v16 → `proxy.ts` here is correct, not a bug.
- `revalidatePath.md`: "If `path` contains a dynamic segment, e.g. `/product/[slug]`, this parameter [`type`] is required." → confirms BUG-1.
- `Motorbike` is a real export in this repo's `lucide-react@1.23.0`, so `Motorbike`/`Truck` imports are not bugs.
- Async `params`/`searchParams` (awaited everywhere) and awaited `cookies()` (`lib/session.ts`) match v16 async-dynamic-API requirements.

There is no `app/sitemap.ts` or `app/robots.ts`, so SEO breakage mitigation for route renames must rely on `redirects()` in `next.config.ts`.

## 1) Route rename map (PT → EN)

Risk legend: **SEO** = external/indexable exposure; **App** = internal-link breakage if a reference is missed.

### `busca` → `search` (`app/(public)/busca/` → `app/(public)/search/`)
- `app/(public)/page.tsx:46` `<Link href="/busca">`, `:50` `<form action="/busca">`, `:76` `href={`/busca?cat=${cat.slug}`}`, `:93` `<Link href="/busca">`
- `app/(public)/busca/page.tsx:54` `<Chip href="/busca">`, `:58` `href={`/busca?cat=${c.slug}`}` (+ rename `BuscaPage`)
- `app/(public)/pedido/[id]/page.tsx:48`, `app/(public)/medicamento/[ean]/page.tsx:41`
- `components/site-footer.tsx:19`
- `components/site-header.tsx:15,16,17,18` (navLinks), `:30` & `:108` (`router.push`)
- Risk: HIGH SEO — public category/search browse page, deep-linked with `?cat=`/`?q=`. Add a permanent redirect `/busca → /search` preserving query.

### `cadastrar` → `register` (`app/cadastrar/` → `app/register/`)
- `proxy.ts:5` (`AUTH_ROUTES`), `:23` (`matcher`)
- `app/(public)/page.tsx:47`, `:118`
- `components/auth/login-form.tsx:30`
- `components/site-footer.tsx:20`
- `components/site-header.tsx:88`, `:138`
- Risk: MEDIUM SEO (signup landing), MEDIUM App (proxy matcher must stay in sync).

### `entrar` → `login` (`app/entrar/` → `app/login/`)
- `proxy.ts:5` (`AUTH_ROUTES`), `:12` (`NextResponse.redirect(new URL("/entrar"…))`), `:23` (`matcher`)
- `actions/auth.ts:25` `redirect("/entrar")`
- `services/auth-guard.service.ts:13` `redirect("/entrar")`
- `components/auth/register-form.tsx:118`
- `components/site-footer.tsx:21`
- `components/site-header.tsx:85`, `:95`
- Risk: LOW SEO (login usually noindex), HIGH App — several server-side redirects hardcode `/entrar`; a miss silently breaks the auth loop.

### `pedido` → `order` (`app/(public)/pedido/[id]/` → `app/(public)/order/[id]/`)
- `app/(public)/medicamento/[ean]/availability-client.tsx:309` `<a href={`/pedido/${comprado}`}>`
- `app/dashboard/pedidos/page.tsx:39`, `:53`
- `app/dashboard/page.tsx:98`
- `actions/orders.ts:49` `revalidatePath(`/pedido/${orderId}`)` (literal path — no `type` arg needed)
- Has `generateMetadata` (title `Pedido …`).
- Risk: HIGH SEO/inbound — customer-facing order-tracking URLs get bookmarked/shared. Add redirect `/pedido/:id → /order/:id`.

### `pedidos` → `orders` (`app/dashboard/pedidos/` → `app/dashboard/orders/`)
- `components/dashboard/sidebar.tsx:14`
- `app/dashboard/page.tsx:90`
- `app/(public)/pedido/[id]/page.tsx:89` (`/dashboard/pedidos`)
- `actions/orders.ts:39`, `:48` `revalidatePath("/dashboard/pedidos")`
- Risk: LOW (auth/noindex, internal). Do together with `pedido → order` to avoid singular/plural confusion.

### `medicamento` → `medicine` (`app/(public)/medicamento/[ean]/` → `app/(public)/medicine/[ean]/`)
- `components/product-card.tsx:19` `<Link href={`/medicamento/${product.ean}`}>`
- `actions/orders.ts:37` `revalidatePath("/medicamento/[ean]")` — also see BUG-1 (missing `type` arg)
- Contains `generateStaticParams`, `generateMetadata` (title + OG), `dynamicParams=true`.
- Risk: VERY HIGH SEO — product detail pages indexed per-EAN with OG tags. Most SEO-critical rename; requires redirects + ideally a sitemap.

### `produtos` → `products` (`app/dashboard/produtos/`)
- `components/dashboard/sidebar.tsx:13`
- `actions/products.ts:50`, `:84`, `:94` `revalidatePath("/dashboard/produtos")`
- Risk: LOW (auth, internal).

### `conta` → `account` (`app/dashboard/conta/`)
- `components/dashboard/sidebar.tsx:17`
- `actions/settings.ts:58` `revalidatePath("/dashboard/conta")`
- Risk: LOW.

### `configuracoes` → `settings` (`app/dashboard/configuracoes/`)
- `components/dashboard/sidebar.tsx:16`
- `actions/settings.ts:37` `revalidatePath("/dashboard/configuracoes")`
- Risk: LOW.

### `relatorios` → `reports` (`app/dashboard/relatorios/`)
- `components/dashboard/sidebar.tsx:15`
- `components/dashboard/report-filters.tsx:19` `href={`/dashboard/relatorios?f=${o.value}`}`, `:25` `<form action="/dashboard/relatorios" method="GET">`
- Risk: LOW.

**Cross-cutting:** `proxy.ts` `matcher` (`["/dashboard/:path*", "/entrar", "/cadastrar"]`) and `AUTH_ROUTES` must be updated atomically with the `entrar`/`cadastrar` renames or auth redirects break. Every `revalidatePath(...)` string is a literal route that must be renamed in lockstep with its folder.

## 2) Portuguese identifier rename table

`kind`: **serialized** = crosses a persistence/network/client-server boundary (DB column, JSON field, `FormData` field name, enum stored in DB) → extra breakage risk; **internal** = safe local/TS-only rename.

### DB columns — `db/schema/*.ts` (serialized, HIGH risk: needs a migration)
| file | current | proposed |
|---|---|---|
| products.ts | `nome` / `"nome"` | `name` |
| products.ts | `descricao` / `"descricao"` | `description` |
| products.ts | `precoCents` / `"preco_cents"` | `priceCents` |
| products.ts | `quantidade` / `"quantidade"` | `quantity` |
| orders.ts | `cepCliente` / `"cep_cliente"` | `customerCep` |
| orders.ts | `tipoEntrega` / `"tipo_entrega"` | `deliveryType` |
| orders.ts | `precoTotalCents` | `totalPriceCents` |
| orders.ts | `freteCents` / `"frete_cents"` | `shippingCents` |
| orders.ts | `distanciaKm` / `"distancia_km"` | `distanceKm` |
| orders.ts | `tempoEstimadoMin` | `estimatedTimeMin` |
| orders.ts | `etapa1At/etapa2At/etapa3At` | `stage1At/stage2At/stage3At` |
| order_items.ts | `nome`, `precoUnitCents`, `quantidade` | `name`, `unitPriceCents`, `quantity` |
| pharmacies.ts | `razaoSocial`, `nomeFantasia` | `legalName`, `tradeName` |
| pharmacies.ts | `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `faturamento` | `street`, `number`, `complement`, `district`, `city`, `state`, `revenue` |
| pharmacy_settings.ts | `cepBase`, `raioKm`, `aceitaRetirada`, `aceitaMoto`, `freteMotoCents` | `baseCep`, `radiusKm`, `acceptsPickup`, `acceptsMoto`, `motoShippingCents` |

Enum values stored in DB (serialized, HIGH — renaming values forces a data migration and touches every keyed `switch`/`Record`): `tipo_entrega` = `retirada|moto|distribuicao`; `status` = `liberado|montado|pronto_coleta|finalizado`; `faturamento` = `ate_50k|50k_200k|200k_500k|acima_500k`. Keyed in `constants.ts` `DELIVERY_TIPOS`, `order.service.ts` `next` map, `report.service.ts` filters, `availability-client.tsx` `TIPO_LABEL`, `pedidos/page.tsx` `NEXT_LABEL`, badge `.replace("_"," ")`.

### FormData field names (serialized: change JSX `name=`, `formData.get()`, and Zod key together)
| current | proposed | files |
|---|---|---|
| `senha` | `password` | register/login forms, `auth.service.ts:47,133`, `validations.ts:37,60` |
| `razaoSocial`, `nomeFantasia` | `legalName`, `tradeName` | register-form, account-form, `auth.service`, `settings` action, `validations` |
| `nome`, `descricao`, `preco`, `quantidade` | `name`, `description`, `price`, `quantity` | product-form, `products` action, `validations` |
| `tipoEntrega` | `deliveryType` | availability-client:145, `orders` action:19 |
| `cepBase`, `raioKm`, `aceitaRetirada`, `aceitaMoto`, `freteMoto` | `baseCep`, `radiusKm`, `acceptsPickup`, `acceptsMoto`, `motoShipping` | settings-form, `settings` action, `validations` |
| `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `faturamento` | `street`, `number`, `complement`, `district`, `city`, `state`, `revenue` | register-form, `auth.service`, `validations` |

### JSON API response fields (serialized: change service type AND client type)
| current | proposed | files |
|---|---|---|
| `PharmacyOffering`: `nomeFantasia,distanciaKm,quantidade,precoCents,tempoEstimadoMin,freteCents,tiposEntrega` | `tradeName,distanceKm,quantity,priceCents,estimatedTimeMin,shippingCents,deliveryTypes` | `search.service.ts:6-15` ↔ `availability-client.tsx:16-25` (`/api/pharmacies`) |
| `RecommendationSchema`: `melhorOpcao,resumo,justificativa,climaConsiderado,alertaClima` | `bestOption,summary,rationale,weatherConsidered,weatherAlert` | `delivery-advisor.service.ts:15-26` ↔ client `DeliveryRecommendation:36-43`; also referenced by name in the LLM prompt (`:82-85`) — HIGH risk |
| `WeatherSnapshot`: `cidade,condicao,temperaturaC,precipitacaoMm,ventoKmh,chuvaForte` | `city,condition,temperatureC,precipitationMm,windKmh,heavyRain` | `weather.service.ts:3-10` ↔ client `WeatherSnapshot:27-34` |

### services / repositories (internal — mostly safe)
| file | current | proposed |
|---|---|---|
| order.service.ts | `precoUnit,precoTotal,etapa2,etapa3,freteCents,distance` | `unitPrice,totalPrice,stage2,stage3,shippingCents,distance` |
| search.service.ts | `DELIVERY_TIPOS` (import), `tipos`, `motoTempo` | `DELIVERY_TYPES`, `types`, `motoTime` |
| report.service.ts | `totalVendido,receitaCents,porRetirada,porMoto,porDistribuicao,topProdutos,vendasPorDia,dia` | `totalSold,revenueCents,byPickup,byMoto,byDistribution,topProducts,salesByDay,day` |
| report.service.ts | dashboardKpis: `produtosCadastrados,vendidosHoje,vendidosMes,aguardandoRetirada,pedidosMoto,receitaEstimada` | `registeredProducts,soldToday,soldThisMonth,awaitingPickup,motoOrders,estimatedRevenue` |
| report.service.ts | `ReportFilter` values `hoje,ontem` + `countByTipo,resolveRange,dKey` | `today,yesterday` + `countByType,resolveRange,dayKey` — note `hoje/ontem` are serialized in `?f=` query (report-filters.tsx) → MEDIUM |
| cep.service.ts | `estadoName` | `stateName` |
| constants.ts | `DELIVERY_TIPOS,FATURAMENTO_OPCOES,ESTADOS_BR,tempoMin` | `DELIVERY_TYPES,REVENUE_OPTIONS,BR_STATES,timeMin` |
| lib/format.ts | `tempoLabel,parseBRLToCents,formatBRL` | `timeLabel,…` |

### components (internal state/handlers — safe)
| file | current | proposed |
|---|---|---|
| availability-client.tsx | `buscar,analisar,escolher,comprar,usarRecomendacao,erro,comprado,tipo,quantidade,alvo,TIPO_LABEL,WeatherIcon(condicao,chuvaForte)` | `search,analyze,choose,buy,useRecommendation,error,purchased,type,quantity,target,TYPE_LABEL,(condition,heavyRain)` |
| product-form.tsx / product-dialog.tsx | `Initial{nome,descricao,precoCents,quantidade}` | `{name,description,priceCents,quantity}` (follows DB rename) |
| settings-form.tsx | `raio,cep,freteDefault` | `radius,cep,shippingDefault` |
| register-form.tsx | `setField` DOM ids `logradouro/bairro/cidade/estado` | follow field rename |

### Portuguese comments (internal, cosmetic — zero runtime risk)
`app/(public)/page.tsx:47,67,89`, `dashboard/page.tsx:62,86`, `medicamento/[ean]/page.tsx:47,59`, `search.service.ts:31-32`, `weather.service.ts:20-21`, `delivery-advisor.service.ts:34-39`, `theme-provider.tsx:8-12`.

## 3) Bug hunt

### [HIGH] Public product-detail revalidation is a no-op (missing `type` arg) — `actions/orders.ts:37`
`revalidatePath("/medicamento/[ean]")`. Per v16 docs a path with a dynamic segment requires `type`. As written it doesn't match the cache entry, so after a purchase the product page's stock isn't invalidated.
Fix: `revalidatePath("/medicamento/[ean]", "page")` (rename the segment consistently later).

### [HIGH] Product create/update/delete never revalidates public pages — `actions/products.ts:50,84,94`
Only `revalidatePath("/dashboard/produtos")` is called. The public product page (`/medicamento/[ean]`, statically generated via `generateStaticParams` with no `revalidate`) and the home page keep serving stale price/description/stock after edits.
Fix: also `revalidatePath("/medicamento/[ean]", "page")` and `revalidatePath("/")` (or tag-based revalidation) in all three product actions.

### [HIGH] Home page is statically prerendered, reads DB only at build time — `app/(public)/page.tsx:11-26`
`HomePage` is a non-async server component reading `productRepo`/`pharmacyRepo` (better-sqlite3) with no dynamic API, no `fetch`, no `revalidate`. Next 16 prerenders it at build, so featured products and the "N farmácias ativas" count are frozen at build output.
Fix: add `export const dynamic = "force-dynamic"` (or `export const revalidate = <seconds>`), or drive updates via `revalidatePath("/")` from mutating actions. Same latent issue on `/medicamento/[ean]` (no `revalidate`). `/busca` is fine — it awaits `searchParams` and is therefore dynamic.

### [MEDIUM] Distribution-center displayed price != charged price — `search.service.ts:87` vs `order.service.ts:59-60`
The synthetic DC offering shows `precoCents: offerings[0]?.precoCents ?? 3990` (cheapest local price or a hardcoded R$39.90), but `placeOrder` charges `productRow.precoCents` from the DC stock row (copied from the global reference product's real price). UI "Total aproximado" and the actual charged total can diverge for DC orders.
Fix: source the DC offering price from the same reference the DC stock uses (`productRepo.getByEanGlobal(ean)[0].precoCents`) and drop the `3990` magic fallback.

### [MEDIUM] Register-time seeded products get the wrong category — `services/auth.service.ts:113-124` + `repositories/index.ts:104`
`SEED_PRODUCTS` in `auth.service` omits `category`, so every product created on signup falls back to the schema default `"respiratorio"` (`products.ts:22`). Category filtering on `/busca` then misclassifies them. `db/seed.ts:15-43` does set per-product categories — the two seed paths are inconsistent.
Fix: add correct `category` to each entry in `auth.service.ts`'s `SEED_PRODUCTS` (mirror `db/seed.ts`).

### [MEDIUM] Check-then-write races / unhandled unique-constraint throws — `actions/products.ts:36-38, 54-83`
`createProductAction` does `getByPharmacyAndEan` then `create`; `updateProductAction` lets the user change `ean` freely. The unique index protects data, but a concurrent create or an edit to a colliding EAN throws an unhandled SQLite error → generic 500 instead of the friendly `{ok:false, fieldErrors:{ean}}`.
Fix: wrap insert/update in try/catch and map the unique-constraint error to the same field error.

### [LOW] `NaN` propagation in quantity input — `availability-client.tsx:296`
`onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}` — `Number("abc")=NaN` → `Math.max(1,NaN)=NaN`, and the total (`selected.precoCents * quantidade`, line 302) renders `R$ NaN`.
Fix: `const n = Number(e.target.value); setQuantidade(Number.isFinite(n) ? Math.max(1, Math.min(selected.quantidade, n)) : 1)`.

### [LOW] AI recommendation may select a delivery type the pharmacy doesn't offer — `availability-client.tsx:127-130, 216-217`
`usarRecomendacao(alvo, recommendation.melhorOpcao)` sets `tipo` to the model's choice without checking `alvo.tiposEntrega.includes(...)`. If mismatched, the finalize card's chip list won't include the active `tipo`, and the frete calc keys off it.
Fix: `tiposEntrega.includes(rec) ? rec : tiposEntrega[0]`.

### [LOW] Weather fetched twice per recommendation — `delivery-advisor.service.ts:67 & 127`
The agent calls the `get_weather` tool, then the service calls `weatherService.getCurrentWeather` again. Two external calls; the second can differ from what the model reasoned over.
Fix: capture the snapshot once (fetch before `run`, pass into prompt, reuse for the response).

### [LOW] Non-null assertion type hole — `search.service.ts:106`
`DC_TEMP_BY_DISTANCE.find((b) => distance <= b.maxKm)!` — safe only because the last band is `Infinity`; `!` silences a real possibility if that invariant changes. (`estimateDelivery`'s returned `freteMotoCents` is also never read by callers.)
Fix: provide an explicit last-element fallback instead of `!`.

### [LOW] Dead / unreachable code — `repositories/orders.ts:6-79`, `repositories/index.ts:113`, `services/auth-guard.service.ts:17`
`orderRepo.create` and `orderRepo.setStatus` are unused (`order.service` does inline SQL); `productRepo.setQuantity` is unused; `requirePharmacyOrReturn` is unused (and typed loosely). Also `orderRepo.create:48` uses global `crypto.randomUUID()` while the rest imports `randomUUID` from `node:crypto`.
Fix: delete dead exports or wire them in; standardize the UUID source.

### [LOW] `metadataBase` hardcoded to localhost — `app/layout.tsx:16`
`metadataBase: new URL("http://localhost:3000")` makes resolved OpenGraph/canonical URLs point to localhost in production.
Fix: derive from an env var (e.g. `process.env.NEXT_PUBLIC_SITE_URL`).

### [LOW] Timezone drift in reporting windows — `repositories/orders.ts:129,140` & `report.service.ts:92`
`new Date().setHours(0,0,0,0)` uses server-local midnight, but timestamps default (`_shared.ts:5-10`) stores `strftime('%s','now')` in UTC. "Hoje"/"soldToday" boundaries can be off by the UTC offset near midnight for BRT.
Fix: compute day boundaries in a fixed zone consistent with how rows are stamped.

### Verified NOT bugs
`proxy.ts` (correct v16 rename of middleware); `Motorbike`/`Truck` lucide imports (exist in `lucide-react@1.23.0`); async `params`/`searchParams` and awaited `cookies()`; synchronous better-sqlite3 calls not awaited (fine); `ThemeProvider` `useSyncExternalStore` (correctly avoids hydration mismatch).

## Suggested phased refactor order

Fix correctness first (cheap, no interface churn), then renames from lowest to highest blast radius, batching each rename with everything it touches so the app never sits broken.

**Phase 0 — Correctness fixes (no renames; independently mergeable)**
1. BUG-1 `revalidatePath(..., "page")` + BUG-2 public revalidation in product actions + BUG-3 DC price source.
2. BUG-4 register seed categories, BUG-5 EAN-collision handling, BUG-8 quantity `NaN`, BUG-7 AI-type guard.
3. Cleanups: dead code, `metadataBase`, weather double-fetch, timezone.

**Phase 1 — Internal-only identifier renames (zero boundary risk)**
Rename internal function/variable names and translate PT comments in `services/`, `components/`, `lib/` (the "internal" rows in section 2), plus `report.service` KPI/`ReportData` fields (consumed only by their own pages). TS compiler catches misses. Do before DB renames so riskier changes land in clean files.

**Phase 2 — Low-risk route renames (auth-gated, noindex)**
`produtos→products`, `conta→account`, `configuracoes→settings`, `relatorios→reports`, `pedidos→orders`. Folder move + its `revalidatePath`/`sidebar`/`report-filters` references. Depends on Phase 0 (correct `revalidatePath` strings).

**Phase 3 — Auth route renames (internal-heavy)**
`entrar→login` and `cadastrar→register` together (both in `proxy.ts` `AUTH_ROUTES`/`matcher` and shared redirect logic). Add `redirects()` for old paths. Verify full login→dashboard→logout loop.

**Phase 4 — High-SEO public route renames (last, with redirects)**
`medicamento→medicine`, then `busca→search`, then `pedido→order`. Need permanent `redirects()` in `next.config.ts` (preserving `[ean]`/`[id]`/query) and ideally an `app/sitemap.ts` (currently absent).

**Phase 5 — Serialized identifier renames (highest risk, optional/last)**
DB columns + enum values + `FormData` fields + JSON API fields (the "serialized" rows). Requires a Drizzle migration (`drizzle-kit generate`) and coordinated changes across schema↔repo↔service↔action↔Zod↔form `name=`↔client types; for `RecommendationSchema` also the LLM prompt text. Enum-value renames need data backfill. Sequence: (a) column names, (b) form/API field names, (c) enum values. Keep behind its own PR — the only phase that can corrupt data if half-applied.

**Dependency summary:** Phase 0 → everything. Phase 1 before 2–5. 2 → 3 → 4 in increasing SEO risk. 5 is orthogonal and highest-risk; do it alone, last, with a migration + redirect/back-compat plan.
