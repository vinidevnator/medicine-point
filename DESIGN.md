---
name: CPV
description: A hyperlocal medicine marketplace wearing institutional pink instead of clinical blue.
colors:
  primary: "#F51C79"
  primary-hover: "#E0156D"
  primary-pressed: "#C81060"
  secondary-purple: "#5A2D82"
  tertiary-blue: "#00A3E0"
  soft-pink: "#FBE3EE"
  gray-900: "#202124"
  gray-800: "#333333"
  gray-700: "#555555"
  gray-600: "#666666"
  gray-500: "#8A8A8A"
  gray-400: "#BDBDBD"
  gray-300: "#DADADA"
  gray-200: "#EEEEEE"
  gray-100: "#F6F6F6"
  white: "#FFFFFF"
  success: "#22C55E"
  warning: "#F59E0B"
  danger: "#EF4444"
  info: "#0EA5E9"
typography:
  display:
    fontFamily: "Inter, 'Open Sans', Roboto, Arial, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: "56px"
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "Inter, 'Open Sans', Roboto, Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: "48px"
    letterSpacing: "-0.4px"
  title:
    fontFamily: "Inter, 'Open Sans', Roboto, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, 'Open Sans', Roboto, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, 'Open Sans', Roboto, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "normal"
  button:
    fontFamily: "Inter, 'Open Sans', Roboto, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "normal"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
  "3xl": "40px"
  "4xl": "48px"
  "5xl": "64px"
  "6xl": "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.gray-800}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.gray-900}"
    rounded: "{rounded.lg}"
    padding: "16px"
  badge-cart:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
---

# Design System: CPV

## 1. Overview

**Creative North Star: "The Institutional Pink"**

CPV is a hyperlocal medicine marketplace, and this system leads with a warm, saturated institutional pink (`#F51C79`) rather than the sterile blues and grays of a hospital intranet — a direct answer to PRODUCT.md's anti-reference against feeling "cold or clinical like a hospital intranet or insurance portal." Pink carries the calls-to-action, links, and active states; deep purple (`#5A2D82`) and sky blue (`#00A3E0`) sit underneath as branding accents; a pale pink tint (`#FBE3EE`) softens backgrounds without diluting the primary color's saturation. The palette is deliberately more "modern e-commerce" than "healthcare portal," matching the brand personality PRODUCT.md calls for: trustworthy, calm, and fast, but not slow or bureaucratic.

**Important note on status:** this DESIGN.md documents the *target* visual system, translated from prior visual research (`docs/design.md`) into the formal token spec. It does not yet match the shipped code, which currently runs a generic blue/slate shadcn-style theme (`app/globals.css`). Treat this file as the spec to redesign the implementation toward, not a record of what's live today.

This is a **product** register: the storefront and the pharmacy dashboard share this one visual language, but each surface optimizes its own primary task — fast comparison and checkout for consumers, fast scanning and action for pharmacy operators. The system explicitly rejects: sterile clinical blues/grays and dense bureaucratic forms; a generic bootstrap-y admin-template look for the dashboard; and discount/flash-sale mechanics (countdown timers, aggressive banners, manufactured urgency) since real urgency here is health-related and manufacturing it would feel exploitative.

**Key Characteristics:**
- Institutional pink as the single loudest color, reserved for action and identity, never for large flat background fields.
- Deep purple and sky blue as quieter branding accents, not competing calls-to-action.
- Fully rounded (pill) buttons and generously rounded (16px) cards/inputs — soft geometry throughout, no sharp corners.
- Nearly flat: shadows are a light touch, not a structural device.
- One typeface family end to end (Inter), carrying everything from a 48px hero down to a 12px caption.

## 2. Colors

A single saturated pink carries identity and action; purple and sky blue add depth without competing; neutrals and pale pink stay quiet in the background.

### Primary
- **Institutional Pink** (`#F51C79`): CTAs, links, active/selected states, the cart badge. This is the color a user should associate with "do the thing."
- **Institutional Pink — Hover** (`#E0156D`): hover state for primary buttons and interactive pink elements.
- **Institutional Pink — Pressed** (`#C81060`): pressed/active state, one step darker than hover.

### Secondary
- **Deep Plum Purple** (`#5A2D82`): brand-mark color, used in logo contexts and secondary branding moments. Not a primary action color.

### Tertiary
- **Sky Blue** (`#00A3E0`): a second branding accent (drawn from the logo), used sparingly alongside purple to add visual variety to brand-only surfaces — never for actions that compete with the primary pink CTA.

### Neutral
- **Soft Pink** (`#FBE3EE`): tinted background for soft sections, banners, and highlighted panels — the warm alternative to a flat white or gray panel.
- **Ink** (`#202124`): primary text color (Gray 900).
- **Charcoal** (`#333333`): secondary heading text (Gray 800).
- **Slate** (`#555555` / `#666666`): body copy and secondary text (Gray 700 / Gray 600).
- **Steel** (`#8A8A8A`): placeholder and disabled text (Gray 500) — verify this still clears 4.5:1 against white before shipping; if not, darken it for placeholder use specifically.
- **Mist** (`#BDBDBD` / `#DADADA`): borders and dividers (Gray 400 / Gray 300).
- **Cloud** (`#EEEEEE` / `#F6F6F6`): subtle surface fills and hover backgrounds (Gray 200 / Gray 100).
- **White** (`#FFFFFF`): base surface and card background.

### Semantic
- **Success** (`#22C55E`): stock-available and confirmation states — deliberately a *different* green from any brand color, so "in stock" reads as information, not decoration.
- **Warning** (`#F59E0B`): caution states (low stock, pending action).
- **Danger** (`#EF4444`): errors, out-of-stock, destructive actions.
- **Info** (`#0EA5E9`): neutral informational callouts, distinct from the branding sky blue in role even though visually adjacent.

### Named Rules
**The Institutional Pink Rule.** Pink is the loudest color in the system and is rationed accordingly: it appears on CTAs, links, active/selected states, and the cart badge — never as a large flat background fill, never as a decorative gradient. If pink is covering more than a button, a badge, or a thin active-state indicator, it's being overused.

**The Borrowed Green Rule.** Success green (`#22C55E`) is semantic only. It must never be treated as a secondary brand accent — it exists exclusively to say "in stock" / "confirmed" / "done," carrying real information per PRODUCT.md's "reassurance over urgency" principle.

## 3. Typography

**Display Font:** Inter (with 'Open Sans', Roboto, Arial, sans-serif fallback)
**Body Font:** Inter (same family, lighter weights)

**Character:** One geometric-humanist sans across every size, from hero to caption — the pairing choice is restraint itself: no serif, no second family, no display-only flourish font. Consistent with a product register where the tool should disappear into the task while consumer-facing screens still get room to breathe via size and weight.

### Hierarchy
- **Display / H1** (700, 48px, 56px line-height, -0.5px tracking): hero headlines only — the CEP search hero, major landing moments.
- **Headline / H2** (700, 40px, 48px line-height, -0.4px tracking): major section headings ("Categorias", "Produtos em destaque").
- **Title / H3–H4** (700/600, 32px–28px, 40px/36px line-height): sub-section and card-group headings.
- **Subtitle** (600, 18px, 28px line-height): card titles, panel headers.
- **Body** (400, 16px, 24px line-height): default paragraph and UI copy; cap prose at 65–75ch.
- **Body Small** (400, 14px, 20px line-height): secondary/supporting copy, table cells.
- **Label** (500, 14px, 20px line-height): form field labels, metadata.
- **Caption** (400, 12px, 16px line-height): timestamps, fine print, helper text.
- **Button** (600, 16px, 24px line-height): all button labels, regardless of variant.

### Named Rules
**The One-Family Rule.** Every text role — hero to caption — is Inter. Weight and size carry hierarchy; a second family is never introduced for "flavor."

## 4. Elevation

The old research explicitly notes "pouco uso de elevação" — little use of elevation — and this system keeps that discipline: surfaces are flat at rest, separated by a 1px border (`#DADADA`) rather than a shadow. A three-step shadow scale exists but is reserved for genuine overlays and interactive feedback, not resting cards.

### Shadow Vocabulary
- **Elevation 1** (`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`): subtle lift on hover for cards and list rows.
- **Elevation 2** (`box-shadow: 0 8px 24px rgba(0,0,0,0.12)`): dropdowns, popovers, the mega-menu panel.
- **Elevation 3** (`box-shadow: 0 12px 32px rgba(0,0,0,0.18)`): modals, drawers, and the top-level dialog layer.

### Named Rules
**The Flat-at-Rest Rule.** No component carries a shadow in its default state. Elevation only appears in response to interaction (hover) or as a structural signal that content is floating above the page (drawer, modal, dropdown).

## 5. Components

Rounded, pill-shaped, and consistent: the same button shape and the same card shape everywhere, so the interface reads as one product across the consumer storefront and the pharmacy dashboard.

### Buttons
- **Shape:** fully rounded, pill (`999px` radius) — no square or slightly-rounded buttons anywhere in the system.
- **Primary:** Institutional Pink background (`#F51C79`), white text, `16px 32px` padding, 600-weight label.
- **Hover / Pressed:** background steps to `#E0156D` on hover, `#C81060` on press — no scale or shadow change, color does the work.
- **Secondary:** white background, gray border, dark text (Gray 800) — used for lower-emphasis actions ("Sou Farmácia" style secondary CTAs).

### Cards
- **Corner Style:** 16px radius (`{rounded.lg}`), consistently across product cards, form cards, and dashboard panels.
- **Background:** white, with a 1px Mist border (`#DADADA`).
- **Shadow Strategy:** flat at rest (see Elevation); Elevation 1 shadow on hover only.
- **Internal Padding:** 24px.
- **States:** hover (Elevation 1 + border tint toward pink) and selected (persistent pink-tinted border) for choosable cards (e.g. delivery method, pharmacy selection).

### Inputs / Fields
- **Style:** 16px radius, 1px border, 16px internal padding.
- **Focus:** border and ring shift to **success green**, not primary pink — a deliberate signal separation so "you're now editing this field" never gets confused with the brand's action color.
- **Error / Disabled:** border shifts to Danger red with an inline message below the field; disabled fields drop to 38% opacity.

### Select
- Same visual contract as Input (radius, border, focus treatment), with a trailing chevron icon.

### Chips / Badges
- **Cart badge:** circular, pink background, white text, reserved for the cart item count — the one place a pure-pink circular badge is allowed.
- **Status badges:** pill-shaped, tinted background using the semantic color at low opacity + full-opacity text (e.g. success-tinted "Disponível", danger-tinted "Esgotado").

### Navigation
- **Top nav (consumer):** ~72px height, logo + primary links + search + location + notifications + account + cart, all on a white bar with a 1px bottom border. Active link uses Institutional Pink text.
- **Dashboard sidebar:** fixed-width side nav, active item gets a pink background fill (not just pink text) so the current section is unambiguous at a glance while scanning quickly.
- **Mobile:** both collapse into a drawer (Elevation 3, slide-in from the left), triggered by a hamburger control.

## 6. Do's and Don'ts

### Do:
- **Do** ration Institutional Pink (`#F51C79`) to CTAs, links, active states, and the cart badge — per the Institutional Pink Rule.
- **Do** use pill-shaped (`999px`) buttons and 16px-radius cards/inputs everywhere; the soft geometry is consistent across both audiences.
- **Do** keep success green (`#22C55E`) strictly semantic — "in stock now," "confirmed," "done" — carrying real information per PRODUCT.md's "reassurance over urgency" principle, never used as decoration.
- **Do** keep surfaces flat at rest and reserve shadows for hover feedback, dropdowns, and overlays only.
- **Do** design for the least tech-comfortable user: generous 16px body text, obvious pink primary actions, forgiving form validation with inline messages.

### Don't:
- **Don't** default to sterile blues and grays — PRODUCT.md explicitly rejects feeling "cold or clinical like a hospital intranet or insurance portal." If a screen is trending toward slate-and-blue with no pink, it's drifting off-brand.
- **Don't** ship the pharmacy dashboard as a generic bootstrap-y admin template. PRODUCT.md is explicit: "no default component library look, no point of view."
- **Don't** introduce countdown timers, aggressive banners, or urgency-manufacturing patterns anywhere in the storefront. PRODUCT.md: "real urgency here is health-related, and manufactured urgency would feel exploitative."
- **Don't** use primary pink as a focus-ring color on form fields — focus is green, action is pink; conflating the two undoes the Borrowed Green Rule.
- **Don't** use `border-left`/`border-right` stripes as a colored accent on cards or alerts, gradient text, or glassmorphism-as-decoration — none of these appear anywhere in this system.
- **Don't** let the primary pink cover large flat background areas; it stays confined to controls and indicators, not page-level fields (that's what Soft Pink `#FBE3EE` is for).
