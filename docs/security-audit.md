# Security Audit — cpv

Stack: Next.js 16.2.9 (App Router) / React 19.2.4 / TypeScript strict / Drizzle + better-sqlite3.
Read-only audit — **no source files were changed**. Every finding was verified against the actual code.

## Guidance applied

Best-practice guidance was taken from the version-matched Next.js 16.2.9 docs bundled in `node_modules/next/dist/docs/` (the source of truth designated by `AGENTS.md`), because the Context7 MCP is network-gated and unavailable to the read-only audit agent.

- `01-app/02-guides/authentication.md` — optimistic vs. secure auth checks; security checks should be performed as close as possible to the data source (DAL); session payload should hold the minimum non-PII data.
- `03-file-conventions/proxy.md` — in v16 `middleware` is renamed to `proxy`, so `proxy.ts` is real edge middleware.
- `02-guides/content-security-policy.md`, `02-guides/production-checklist.md` — recommend CSP + baseline security headers.
- Server Actions in v16 ship POST-only + same-origin protection, so classic CSRF on the actions themselves is already mitigated (no CSRF finding raised on the actions).

## Prioritized summary

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | High | Unauthenticated, unthrottled OpenAI advisor route → cost-amplification DoS | `app/api/delivery-advisor/route.ts` + `services/delivery-advisor.service.ts:106` |
| 2 | Medium | Unauthenticated order detail exposes medications + location (capability URL) | `app/(public)/pedido/[id]/page.tsx:25` |
| 3 | Medium | No brute-force / rate-limit protection on login | `actions/auth.ts:17` / `services/auth.service.ts:130` |
| 4 | Medium | Missing CSP & security headers (clickjacking, referrer leak, no XSS depth) | `next.config.ts:7` |
| 5 | Low | Upstream (OpenAI) error text leaked to client | `services/delivery-advisor.service.ts:130` |
| 6 | Low | Account enumeration on registration | `services/auth.service.ts:69` |
| 7 | Low | Insecure committed fallback secret when `NODE_ENV != production`; weak secret policy | `lib/env.ts:11` |

## Findings

### [HIGH] Unauthenticated, unthrottled AI/OpenAI proxy → cost-amplification DoS
`app/api/delivery-advisor/route.ts:6-45` → `services/delivery-advisor.service.ts:106-128`

Every anonymous `POST /api/delivery-advisor` runs a full OpenAI Agent (`run(agent, prompt, { maxTurns: 4 })`) plus 1–2 Open-Meteo calls. There is no session check, no rate limit, no CAPTCHA, and no per-IP/per-EAN quota. Inputs only need a valid-format 13-digit EAN + 8-digit CEP, and `searchService.findByEanAndCep` returns a synthetic distribution-center offering for any real EAN (`services/search.service.ts:78-92`), so the `offerings.length === 0` short-circuit rarely triggers.

- Why exploitable: a scripted client can fire thousands of requests, each incurring real OpenAI spend (up to 4 model turns) — a direct financial-DoS / billing-exhaustion vector, plus abuse of the upstream weather API from your server IP.
- Remediation: put the route behind rate limiting (per-IP token bucket via `proxy.ts` or an edge/WAF limiter), add a short-TTL cache keyed by `ean+cep` (result is deterministic per city), cap `maxTurns`, consider a lightweight turnstile/proof-of-work for anonymous callers, and set a hard monthly OpenAI budget with alerts.

### [MEDIUM] Unauthenticated order detail exposes purchased medications + location
`app/(public)/pedido/[id]/page.tsx:25-41` → `repositories/orders.ts:60-65`

`orderRepo.get(id)` is called with no auth and no ownership check. Anyone holding an order id sees purchased medications (`items[].nome/ean`), totals, delivery type, and partial CEP. Purchased-medication data is sensitive health information.

- Mitigating factor: order ids are `randomUUID()` v4 (128-bit, `services/order.service.ts:58`), so enumeration is impractical — this is effectively a capability URL. Real risk is URL leakage via Referer headers, browser history, logs, or link sharing, amplified by the absence of a `Referrer-Policy` (see finding 4). Customers are anonymous (no user accounts), so there is no session to bind the order to.
- Remediation: treat the id as a secret capability — set `Referrer-Policy: no-referrer` (or `same-origin`), avoid logging full paths, keep the page `noindex`. For stronger control, issue a signed, expiring token bound to the order instead of exposing the raw UUID, or minimize displayed PII.

### [MEDIUM] No brute-force / rate-limit protection on login
`actions/auth.ts:17-21` → `services/auth.service.ts:130-153`

`login` runs `bcrypt.compareSync` with no attempt throttling, lockout, or delay, enabling online credential stuffing / brute force against `pharmacy_admin` accounts (password policy is only `min(8)`, `lib/validations.ts:37-39`).

- Positive: login responses are generic ("Credenciais inválidas") for both unknown-user and bad-password (`auth.service.ts:145,149`), so login does not leak account existence.
- Remediation: add per-account + per-IP rate limiting with exponential backoff/lockout on repeated failures; consider a password-strength requirement beyond length.

### [MEDIUM] Missing security headers / CSP
`next.config.ts:7-11` (only sets `allowedDevOrigins`; no `headers()` block; none in `proxy.ts` either)

No `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, or `Referrer-Policy`.

- Why it matters: no clickjacking protection (dashboard can be framed), no defense-in-depth against XSS, and default Referer behavior leaks the capability URLs from finding 2 to third parties.
- Remediation: add a `headers()` block (or set headers in `proxy.ts`) with a strict CSP, `X-Frame-Options: DENY` / `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and HSTS in production.

### [LOW] Upstream error messages leaked to the client
`services/delivery-advisor.service.ts:129-131` → `app/api/delivery-advisor/route.ts:41-42`

On failure the raw `err.message` (from the OpenAI SDK / agent runtime) is returned in the JSON body (`{ error: result.error }`), which can disclose internal SDK/model details or configuration hints to unauthenticated clients.

- Remediation: log the detailed error server-side; return a generic client message ("Não foi possível gerar a recomendação.").

### [LOW] Account enumeration on registration
`services/auth.service.ts:68-70`

`register` returns "E-mail já cadastrado." as a field error, letting an attacker probe which emails are registered pharmacies.

- Remediation: return a generic response, or gate registration behind rate limiting; at minimum keep the message but throttle.

### [LOW] Insecure hardcoded fallback secret + weak secret policy
`lib/env.ts:3-12`

If `NODE_ENV != "production"`, `requireSecret()` silently returns the committed constant `"dev-insecure-secret-please-override-in-env-local-0000"`, used as the HS256 signing key (`lib/session.ts:10`). Only string length ≥ 32 is enforced — not entropy.

- Why exploitable: any deployment running without `NODE_ENV=production` (misconfig, preview, or a runner defaulting to `development`) signs session JWTs with a public, known key → arbitrary session forgery (mint a valid `mp_session` for any `pharmacyId`, full tenant takeover).
- Mitigating factor: `scripts/bootstrap.ts:6-17` auto-writes a random `AUTH_SECRET` to `.env.local` during `predev`/`prebuild`, and production throws if the secret is unset — so the standard flow is safe.
- Remediation: fail closed even outside production (or require the bootstrap secret to be present), and document that `NODE_ENV=production` must be set in prod.

## Surfaces verified clean (no action needed)

- Authorization on all mutating server actions: product create/update/delete (`actions/products.ts:17,55,89`), `updateSettingsAction`/`updateAccountAction` (`actions/settings.ts:15,43`), `advanceOrderAction` (`actions/orders.ts:44`) all call `requirePharmacy()` and enforce tenant ownership (`product.pharmacyId !== session.pharmacyId` at `products.ts:71,92`; `order.pharmacyId !== pharmacyId` at `order.service.ts:119`). No IDOR on product/order-status mutations. `buyNowAction` is intentional public checkout and recomputes price/frete server-side (`order.service.ts:52-60`); client-supplied price is never trusted.
- Dashboard pages enforce auth at the data layer, not just in `proxy.ts` (`app/dashboard/layout.tsx:9`, `pedidos/page.tsx:20`, `relatorios/page.tsx:12`). All report/order queries are scoped by `session.pharmacyId` (`repositories/orders.ts:66-156`).
- SQL injection: Drizzle query builder with bound params throughout; the only `sql``` templates (`order.service.ts:70`, `orders.ts:123,131,142,151`) interpolate column references and a validated numeric, which Drizzle parameterizes. No string concatenation of user input.
- SSRF: all outbound `fetch()` targets are fixed hosts (`viacep.com.br`, `*.open-meteo.com`) built via the `URL` API with sanitized values (digits-only CEP, URL-encoded city). No user-controlled scheme/host.
- Open redirect: every redirect target is a hardcoded literal (`/dashboard`, `/entrar`). No user-controlled `next`/`returnUrl`.
- Input validation / mass assignment: inputs read field-by-field from `FormData` and validated with zod (`lib/validations.ts`); repos take typed inputs and never spread raw client objects, so `pharmacyId`/`role`/`id` can't be injected. `relatorios` searchParams are whitelisted.
- Cookie/session security: `mp_session` is `httpOnly`, `secure` in prod, `sameSite: "lax"`, `path:"/"`, 7-day maxAge (`lib/session.ts:42-48`), signed HS256 and verified with signature + `exp` (`:31`). Payload holds only `userId/pharmacyId/role` — no PII.
- API input hardening: `pharmacies` and `cep` routes strip non-digits and length-check EAN/CEP before use (`app/api/pharmacies/route.ts:6-13`, `app/api/cep/route.ts:6-9`).

## Recommended order

1. Rate-limit + cache the AI advisor route (finding 1).
2. Rate-limit login (finding 3) and add security headers / CSP (finding 4).
3. Address findings 2, 5, 6, 7 (lower risk, partly mitigated by UUID unpredictability, the bootstrap secret, and generic login errors).
