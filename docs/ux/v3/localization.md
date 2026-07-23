# Localization Strategy V3

Phase 16 bilingual UX. Arabic and English are **equal** — not Arabic-with-English-fallback. Implementation spans Flutter (`app_ar.arb` / `app_en.arb`), Next.js (`@suqya/i18n`), and API (`Accept-Language`, `locale.middleware.ts`).

---

## RTL / LTR

| Locale | `Directionality` / `dir` | Layout model |
|--------|--------------------------|--------------|
| `ar` | RTL | Logical properties (`inline-start`, `margin-inline-end`) |
| `en` | LTR | Same logical properties — no physical `left`/`right` in new code |

**LTR-native layouts (V3 principle):** Do not mirror the entire Arabic UI into a flipped English clone. Both locales share one component tree; direction is a runtime attribute. Map controls, compass, and geographic gestures remain **LTR geographic** in both locales.

**What mirrors with direction**

- Chevrons, back affordances, tab order, sheet slide axis (shared-axis push reverses in RTL)
- Nav rails and sidebars attach to `inline-start`
- List row trailing icons

**What does not mirror**

- Map rotation, compass rose, lat/lng readouts
- Phone numbers, OTP fields, order IDs, ticket IDs
- Progress bars for download/upload (always LTR)
- Video scrubbers, range sliders with min→max left→right

**Mixed content:** user-generated Latin in RTL UI uses `dir="auto"` (web) or `Bidi` isolate (Flutter). API returns `textDirection` hint only for known templates.

---

## Numbers and dates

| Data type | Rule |
|-----------|------|
| Currency | Always `SAR` or `ر.س`; amount uses locale numerals |
| Arabic-Indic numerals | User toggle in Settings (customer/driver); default **on** for `ar`, **off** for `en` |
| Western digits | OTP, phone, order ID, CR number — always Western |
| Dates (UI) | `ar-SA` / `en-SA` via `Intl.DateTimeFormat`; relative time localized ("منذ ٥ د" / "5m ago") |
| Dates (legal) | Invoice/ZATCA block uses Gregorian + Hijri where required; language-specific labels |
| Percentages | KPI deltas: `+١٢٪` / `+12%` |
| Units | `م³` / `m³`; km: `كم` / `km` |

**API:** JSON numbers stay Western; formatting is client-side only.

---

## Documents

| Document | Bilingual behavior |
|----------|-------------------|
| Invoice (ZATCA) | Arabic legal mandatory; EN customer summary optional second page |
| Receipt email | Template per `user.locale` |
| Settlement PDF (supplier) | Bilingual header row; line items single language per tenant default |
| POD photo | No text overlay localization; metadata timestamp in user locale |
| Export CSV (admin) | Column headers in export language selector (defaults to admin locale) |

**Storage:** `Invoice.pdfUrl` is locale-agnostic; generate-on-demand with `?locale=` if variants needed.

---

## Search

| Surface | Strategy |
|---------|----------|
| Customer Help FAQ | Index `questionAr`, `questionEn`, `answerAr`, `answerEn`; search active locale first, fallback other locale with badge "English result" / "نتيجة بالعربية" |
| Address search | Map provider locale param (`language=ar` or `en`); display dual-line if geocoder returns both |
| Admin order search | ID/phone always Western; name search Unicode-normalized NFC |
| Supplier order filter | Status labels localized; filter values canonical English enums internally |

**Debounce:** 300ms; empty state copy localized.

---

## AI output strategy

Suqya may surface AI-assisted copy (support suggestions, dispatch summaries). Rules:

1. **Respond in user locale** — if `Accept-Language: en`, model output English only unless user asks otherwise.
2. **No auto-translate user tickets** — show original with optional "Translate" action (on-device or API `POST /translate` with audit).
3. **Structured outputs** — JSON schema fields `titleAr`, `titleEn` when shown in admin bilingual dashboards.
4. **Safety strings** — refusal messages pre-approved in both languages; never free-form for compliance topics.
5. **Confidence** — if source data is single-language, prefix with `[Auto-translated]` / `[مترجم آلي]` when displaying in the other locale.
6. **RTL in chat bubbles** — assistant markdown rendered with `dir` matching output language, not app shell.

**Logging:** store `locale` + `modelVersion` on AI audit rows for disputes.

---

## String inventory

| Layer | Source | Coverage gate |
|-------|--------|---------------|
| Flutter | `lib/l10n/app_*.arb` | 100% key parity CI check |
| Web | `@suqya/i18n` JSON | Same keys as Flutter where shared |
| API errors | `api-messages.ts` | `messageAr`, `messageEn` on all user-facing errors |
| Push | notification templates DB | Both bodies required before send |
| Email/SMS | template service | Both or blocked by linter |

---

## Locale resolution order

1. Authenticated user profile `locale`
2. Explicit header `Accept-Language` / query `?locale=`
3. Cookie / `localStorage` (web)
4. Device default
5. Fallback: `ar` (Saudi market default)

---

## QA checklist

- [ ] Cold start in EN → entire customer 3-tap in LTR
- [ ] Switch AR → EN mid-session → no orphan RTL padding
- [ ] FAQ search finds EN answer when UI is AR (with badge)
- [ ] Invoice PDF opens with correct legal language block
- [ ] AI support suggestion matches ticket locale
- [ ] Web admin tables align headers in both directions
