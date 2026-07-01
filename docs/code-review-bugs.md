# Code Review — Bug Report

Scope: uncommitted changes in the working tree (Phase 1 marketplace implementation — auth, products, orders, search, reports, dashboard). Reviewed against `docs/phase1.md` spec and cross-file consistency. `npx tsc --noEmit` and `npx eslint .` both pass with zero errors/warnings; no `any` usage found anywhere in the codebase.

## Summary Table

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | Critical | Orders / Auth | Any pharmacy can advance any other pharmacy's order (missing ownership check) |
| 2 | High | Orders / Pricing | Moto freight charged on order ignores per-pharmacy `freteMotoCents`, hardcoded to 599 |
| 3 | High | Orders / Search | "Centro de Distribuição" offering is always shown but purchase always fails |
| 4 | High | Reports | Custom date-range filter passes `NaN` timestamps (`Number()` on `YYYY-MM-DD` string) |
| 5 | Medium | Orders / Concurrency | Stock check-then-decrement race condition can oversell inventory |
| 6 | Low | Products / Validation | Price/quantity fields accept non-numeric input, silently defaulting to 0 |

---

## 1. [Critical] Broken access control: any pharmacy can advance any other pharmacy's order

**Files:** `actions/orders.ts`, `services/order.service.ts`

```43:50:actions/orders.ts
export async function advanceOrderAction(formData: FormData): Promise<void> {
  await requirePharmacy();
  const orderId = String(formData.get("id") ?? "");
  if (!orderId) return;
  orderService.advance(orderId);
  revalidatePath("/dashboard/pedidos");
  revalidatePath(`/pedido/${orderId}`);
}
```

```79:94:services/order.service.ts
  advance(orderId: string): void {
    const detail = getOrder(orderId);
    if (!detail) return;
    const order = detail.order;
    ...
    db.update(orders).set(patch).where(eq(orders.id, orderId)).run();
  },
```

`requirePharmacy()` is called only to confirm the caller is *some* logged-in pharmacy — its returned `session.pharmacyId` is never compared against `order.pharmacyId`. Any authenticated pharmacy admin can advance the status of an order that belongs to a **different** pharmacy simply by knowing/guessing an order id (order ids are also exposed publicly via `/pedido/[id]` links). This is inconsistent with every other mutating action in the codebase (`updateProductAction`, `deleteProductAction`, `updateSettingsAction`, etc.), which all explicitly check `product.pharmacyId !== session.pharmacyId` before mutating.

**Fix:** In `orderService.advance`, require and verify `pharmacyId` (or verify ownership in the action before calling the service), returning early if `order.pharmacyId !== session.pharmacyId`.

---

## 2. [High] Motoentrega freight charged to the customer does not match the quoted price (hardcoded vs. per-pharmacy setting)

**Files:** `services/search.service.ts`, `services/order.service.ts`, `components/dashboard/settings-form.tsx`

Pharmacies can configure a custom moto delivery fee (`freteMoto`, stored as `freteMotoCents`):

```66:68:components/dashboard/settings-form.tsx
      <Field label="Frete moto (R$)" htmlFor="freteMoto" error={state.fieldErrors?.freteMoto} hint="Valor cobrado pela moto entrega.">
        <Input id="freteMoto" name="freteMoto" inputMode="decimal" defaultValue={freteDefault} invalid={!!state.fieldErrors?.freteMoto} />
      </Field>
```

The **search/quote** path correctly reads this per-pharmacy value:

```51:59:services/search.service.ts
      if (row.settings.aceitaMoto) {
        tipos.push("moto");
        const motoTempo = Math.min(...);
        tempo = Math.min(tempo, motoTempo);
        frete = row.settings.freteMotoCents;
      }
```

But the **order placement** path ignores it and hardcodes `599`:

```93:104:services/search.service.ts
  estimateDelivery(
    tipo: "retirada" | "moto" | "distribuicao",
    distance: number
  ): { tempoMin: number; freteCents: number; freteMotoCents: number } {
    if (tipo === "retirada") return { tempoMin: DELIVERY_TIPOS.retirada.tempoMin, freteCents: 0, freteMotoCents: 0 };
    if (tipo === "moto") {
      const t = Math.min(DELIVERY_TIPOS.moto.tempoMin, 30 + Math.round(distance * 6));
      return { tempoMin: t, freteCents: 599, freteMotoCents: 599 };
    }
    ...
```

...which `placeOrder` uses directly to compute `precoTotal`:

```27:34:services/order.service.ts
    const offerings = searchService.findByEanAndCep(input.productEan, input.cepCliente);
    const offering = offerings.find((o) => o.pharmacyId === input.pharmacyId);
    const distance = offering?.distanciaKm ?? 5;
    const est = searchService.estimateDelivery(input.tipoEntrega, distance);
    ...
    const precoTotal = precoUnit * input.quantidade + est.freteCents;
```

**Impact:** If a pharmacy sets a moto fee different from R$ 5,99 (the seed default), the amount shown to the customer on the PDP (`AvailabilityClient`, "Total aproximado") will not match the amount actually stored/charged on the order. This is a real billing/quote-vs-charge mismatch.

**Fix:** `placeOrder` should reuse the already-computed `offering.freteCents` (which reflects the pharmacy's actual settings) instead of recomputing a hardcoded value via `estimateDelivery`.

---

## 3. [High] "Centro de Distribuição" option is always shown but can never actually be purchased

**Files:** `services/search.service.ts`, `services/order.service.ts`, `app/(public)/medicamento/[ean]/availability-client.tsx`

Per spec (`docs/phase1.md`, "Regras de Negócio"): *"Centro de distribuição sempre disponível."* The search service always appends a synthetic offering with a fake `pharmacyId: "dc"`:

```76:88:services/search.service.ts
    if (!offerings.some((o) => o.nomeFantasia === "Centro de Distribuição")) {
      const dcTemp = DC_TEMP_BY_DISTANCE[0];
      offerings.push({
        pharmacyId: "dc",
        nomeFantasia: "Centro de Distribuição",
        ...
      });
    }
```

The client lets the user select this offering and submit a real purchase against it (no special-casing of `pharmacyId === "dc"` in `AvailabilityClient.comprar()`). But `placeOrder` looks up stock via `productRepo.getByPharmacyAndEan("dc", ean)`, and since no real pharmacy/product row exists with id `"dc"`, this always returns `undefined`:

```22:26:services/order.service.ts
  placeOrder(input: PlaceOrderInput): PlaceOrderResult {
    const productRow = productRepo.getByPharmacyAndEan(input.pharmacyId, input.productEan);
    if (!productRow || productRow.quantidade < input.quantidade) {
      return { ok: false, error: "Estoque insuficiente para o pedido." };
    }
```

**Impact:** Every attempt to buy through the Centro de Distribuição option fails with a misleading "Estoque insuficiente para o pedido" error, even though the UI presents it as always available with 999 units in stock. This directly contradicts the spec requirement that this channel is always usable.

**Fix:** Either back the DC offering by a real fulfillment path (e.g. route to the nearest pharmacy with stock, or a dedicated DC "virtual pharmacy" row seeded in the DB) or special-case DC orders in `orderService.placeOrder`.

---

## 4. [High] Custom date-range report filter is completely broken (NaN dates)

**Files:** `components/dashboard/report-filters.tsx`, `app/dashboard/relatorios/page.tsx`, `services/report.service.ts`

The custom filter form uses native `<input type="date">`, which submits values like `"2026-07-01"`:

```30:38:components/dashboard/report-filters.tsx
      {current === "custom" && (
        <form action="/dashboard/relatorios" method="GET" className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="f" value="custom" />
          <label className="text-xs text-muted-foreground">De
            <input type="date" name="from" className="mt-1 block h-9 rounded-lg border border-input bg-card px-2 text-sm" />
          </label>
          <label className="text-xs text-muted-foreground">Até
            <input type="date" name="to" className="mt-1 block h-9 rounded-lg border border-input bg-card px-2 text-sm" />
          </label>
```

The page then does a naive `Number(...)` conversion, expecting a Unix timestamp:

```14:15:app/dashboard/relatorios/page.tsx
  const custom = from && to ? { from: Number(from), to: Number(to) } : undefined;
```

`Number("2026-07-01")` evaluates to `NaN`. This `NaN` value flows into `reportService.resolveRange` → `orderRepo.summaryForRange(pharmacyId, NaN, NaN)` → `new Date(NaN * 1000)` (`Invalid Date`) used in Drizzle `gte`/`lte` comparisons, silently producing an empty/garbage report instead of the expected date-filtered data.

**Impact:** The "Personalizado" report filter — an explicitly required feature in the spec ("Período personalizado") — never works; selecting any custom date range yields (at best) an empty report with no error shown to the user.

**Fix:** Parse the `YYYY-MM-DD` strings with `Date.parse(...)`/`new Date(...).getTime()` (converted to seconds) rather than `Number(...)`, and validate the parsed values before use.

---

## 5. [Medium] Stock check/decrement has a TOCTOU race condition (potential overselling)

**File:** `services/order.service.ts`

```22:34:services/order.service.ts
  placeOrder(input: PlaceOrderInput): PlaceOrderResult {
    const productRow = productRepo.getByPharmacyAndEan(input.pharmacyId, input.productEan);
    if (!productRow || productRow.quantidade < input.quantidade) {
      return { ok: false, error: "Estoque insuficiente para o pedido." };
    }
    ...
    db.transaction((tx) => {
      ...
      tx.update(products)
        .set({ quantidade: productRow.quantidade - input.quantidade, updatedAt: now })
        .where(eq(products.id, productRow.id))
        .run();
    });
```

The stock read (`productRow.quantidade`) happens outside the transaction, and the final `quantidade` is computed from that stale in-memory value rather than an atomic decrement (e.g. `SET quantidade = quantidade - :qty WHERE id = :id AND quantidade >= :qty`). Under concurrent `buyNowAction` calls for the same product, two requests can both pass the initial check and both write a decrement based on the same stale `productRow.quantidade`, allowing stock to go negative / be oversold — violating the spec rule "Estoque deve ser decrementado após compra" (implying a race-safe decrement).

**Fix:** Perform the availability check and decrement atomically inside the transaction, e.g. a conditional `UPDATE ... WHERE quantidade >= ?` and check the affected row count, or re-read the row for update inside the transaction.

---

## 6. [Low] Product price/quantity form validation accepts non-numeric input silently as zero

**Files:** `lib/validations.ts`, `actions/products.ts`, `lib/format.ts`, `lib/masks.ts`

```32:38:lib/validations.ts
export const productSchema = z.object({
  ean: z.string().regex(eanRegex, { error: "EAN deve ter 13 dígitos" }),
  nome: z.string().min(3, { error: "Informe o nome" }),
  descricao: z.string().min(3, { error: "Informe a descrição" }),
  preco: z.string().min(1, { error: "Preço inválido" }),
  quantidade: z.string().min(1, { error: "Quantidade inválida" }),
  imagePath: z.string().optional().default(""),
});
```

`preco` and `quantidade` are only checked for non-emptiness, not that they represent valid numbers. Downstream:

```10:15:lib/format.ts
export function parseBRLToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const reais = Number(cleaned);
  if (!Number.isFinite(reais)) return 0;
  return Math.round(reais * 100);
}
```

and `Number(onlyDigits(d.quantidade))` in `actions/products.ts` both silently fall back to `0` for non-numeric input instead of surfacing a validation error. A pharmacy could end up creating/updating a product with a price of R$ 0,00 or 0 stock without any warning if a stray non-numeric character sneaks through (e.g. a paste of "R$" only, or a locale artifact), which then immediately appears live on the public storefront.

**Fix:** Validate numeric shape in the Zod schema (e.g. `.refine` checking parseability and positivity) rather than relying on silent fallback-to-zero in the formatting helpers.
