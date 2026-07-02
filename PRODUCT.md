# Product

## Register

product

## Users

Two distinct groups, both on the same platform:

- **Consumers** searching for medicine near them by CEP (postal code). Often in an urgent or stressed state (looking for something to treat a symptom now), with mixed tech comfort — this includes older users who are not power users of apps. Their job to be done: find who has the medicine in stock nearby, compare price, and choose pickup, motoentrega (moto delivery), or distribution-center delivery, then complete the order with minimal friction.
- **Pharmacy owners/staff** running an independent pharmacy on the platform. Their job to be done: manage their product catalog, keep stock and pricing current, watch incoming orders, fulfill them, and understand their performance (reports).

## Product Purpose

CPV is a hyperlocal medicine marketplace: it connects consumers to nearby independent pharmacies so they can compare price and availability for a medicine and get it via pickup, moto delivery, or a distribution center, instead of calling around town. For pharmacies, it's a lightweight storefront and order-management tool that lets a local pharmacy compete on visibility without building their own e-commerce stack. Success looks like: a consumer finds and orders medicine faster than calling pharmacies one by one, and a pharmacy owner can manage listings/orders without confusion or training.

## Brand Personality

Trustworthy, calm, fast. This is healthcare-adjacent — people arrive stressed, sometimes for themselves, sometimes for a sick family member — so the interface should never add friction or anxiety. At the same time it's a marketplace with real commerce mechanics (price comparison, delivery ETAs, stock), so it should feel efficient and modern like a well-built e-commerce product, not slow or bureaucratic like a health portal.

## Anti-references

- Not cold or clinical like a hospital intranet or insurance portal (sterile blues/grays, dense forms, no warmth).
- Not a generic bootstrap-y admin template for the pharmacy dashboard (default component library look, no point of view).
- Not a discount/flash-sale e-commerce site — no countdown timers, aggressive banners, or urgency-manufacturing patterns; real urgency here is health-related, and manufactured urgency would feel exploitative.

## Design Principles

- **Reassurance over urgency.** Even though users may be stressed, the interface should feel calm and in-control, never anxious or alarmist. Save real urgency signals (e.g. "in stock now," delivery ETA) for where they carry real information.
- **One product, two audiences.** The consumer storefront and the pharmacy dashboard share one visual language, but each screen optimizes for its own primary task: fast comparison and checkout for consumers, fast scanning and action for pharmacy operators managing orders.
- **Clarity scales down to the least tech-comfortable user.** Legible type, obvious primary actions, and forgiving forms — design for a worried parent on a phone, not just a power user.
- **Speed without feeling transactional-cold.** Fast paths (search → compare → order) should still feel considered and human, not like a bare-bones utility screen.
- **Local and specific, not generic.** Surface real local signals (pharmacy proximity, delivery method/time, stock) prominently; avoid generic marketplace filler that could belong to any category.

## Accessibility & Inclusion

WCAG 2.1 AA as the baseline across both the public storefront and the dashboard. Given the likely presence of older users and users acting under stress, err toward generous text size and contrast rather than the AA minimum, and ensure interactive targets (buttons, delivery-method choices, form fields) are comfortably sized on mobile. Motion should respect `prefers-reduced-motion`.
