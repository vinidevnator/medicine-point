<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16.2.9 (App Router; no `pages/` directory)
- React 19.2.4
- TypeScript (strict, `moduleResolution: "bundler"`)
- Tailwind CSS v4 via `@tailwindcss/postcss`
- ESLint flat config extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

## Commands

The only npm scripts are:

- `npm run dev` — `next dev`
- `npm run build` — `next build`
- `npm run start` — `next start`
- `npm run lint` — `eslint`

There is **no `test` or `typecheck` script**. To typecheck, run `npx tsc --noEmit` directly (tsconfig already has `noEmit: true`). There is no test runner installed.

## Layout

- `app/` is the source root. Real entrypoints: `app/layout.tsx` (root layout) and `app/page.tsx` (home route).
- No `src/` directory.
- Path alias `@/*` resolves to `./*` (project root), **not** `src/*`.

## Tailwind v4

This project uses Tailwind v4, not v3. CSS entry is `app/globals.css` and uses the v4 syntax:

- `@import "tailwindcss";` (not the v3 `@tailwind base/components/utilities` directives)
- Theme tokens are declared inside an `@theme inline { ... }` block

PostCSS config is in `postcss.config.mjs` using `@tailwindcss/postcss`.

## Generated route types

`next-env.d.ts` imports `.next/dev/types/routes.d.ts`, which declares global `PageProps<'/route'>` and `LayoutProps<'/route'>` types keyed by route literal. Use these to type page/layout `params` and `searchParams` instead of hand-rolling prop types.

## Docs source of truth

For any Next.js API, convention, or migration question, read the version-matched docs bundled in `node_modules/next/dist/docs/` (App Router lives under `01-app/`). Public site docs may reflect a different version.

## Design Context

- **`PRODUCT.md`** (project root): register, users, product purpose, brand personality, anti-references, design principles, accessibility. Read this before any UI/UX work.
- **`docs/design.md`**: visual system reference (colors, typography, spacing, components). Note: it was reverse-engineered from an external reference brand and does not yet match the colors actually implemented in `app/globals.css`; treat it as a starting reference, not ground truth, until reconciled (see `/impeccable document`).
