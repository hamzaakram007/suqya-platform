# Suqya Design System

Arabic-first, RTL-optimized design system for the Water Tanker Ordering Platform.

## Brand Identity

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#0A6E6E` | Primary actions, headers, water theme |
| `--color-primary-dark` | `#085656` | Pressed states |
| `--color-accent` | `#C9A227` | Premium highlights, badges |
| `--color-surface` | `#FFFFFF` | Cards, sheets |
| `--color-background` | `#F5F8F8` | Page background |
| `--color-text` | `#1A2B2B` | Primary text |
| `--color-text-secondary` | `#5A6E6E` | Secondary text |
| `--color-error` | `#D32F2F` | Errors, cancellations |
| `--color-success` | `#2E7D32` | Completed, delivered |
| `--color-warning` | `#F57C00` | Pending, credit due |

## Typography

| Role | Arabic | Latin | Size |
|------|--------|-------|------|
| Display | IBM Plex Sans Arabic Bold | Inter Bold | 32px |
| Heading | IBM Plex Sans Arabic SemiBold | Inter SemiBold | 24px |
| Body | IBM Plex Sans Arabic Regular | Inter Regular | 16px |
| Caption | IBM Plex Sans Arabic Regular | Inter Regular | 14px |
| Button | IBM Plex Sans Arabic Medium | Inter Medium | 16px |

## Spacing Scale

4, 8, 12, 16, 24, 32, 48, 64 (px)

## RTL Guidelines

- Use logical properties: `margin-inline-start`, `padding-inline-end`
- Mirror directional icons (chevrons, arrows)
- Bottom navigation order reversed in RTL
- Map controls remain LTR (Google Maps convention)
- Numbers: support Arabic-Indic numerals via locale

## Components

### Primary Button
- Min height: 48dp (mobile), 40px (web)
- Full-width on mobile for CTAs
- Rounded: 12px
- Primary color background, white text

### Order CTA (Floating)
- Fixed bottom, full width minus 32px margin
- Label: "اطلب الآن" / "Order Now"
- Shadow elevation 4

### Tank Size Card
- Icon: truck silhouette
- Capacity in large text (e.g., "18 طن")
- Price below in SAR
- Selected state: primary border 2px

### Status Badge
- `pending`: warning color
- `in_transit`: primary color
- `completed`: success color
- `cancelled`: error color

---

## Screen Wireframes

### Customer App (22 screens)

| # | Screen | Description |
|---|--------|-------------|
| 1 | Splash | Logo animation, teal gradient, 2s auto-advance |
| 2-4 | Onboarding | 3 slides: order fast, track live, pay easy |
| 5 | Login | Phone input +966 prefix, large numeric keypad |
| 6 | OTP | 6-digit boxes, resend timer, auto-submit |
| 7 | Home | Map preview, last address, "اطلب الآن" FAB, quick reorder |
| 8 | MapPicker | Full-screen map, pin drop, confirm address |
| 9 | NewOrder | Address card, tank size chips, price estimate |
| 10 | TankSelect | Grid of tank cards with prices |
| 11 | PaymentSelect | Cash / Card / Credit tabs, total with VAT |
| 12 | Tracking | Full map, driver marker, ETA, status timeline |
| 13 | History | Order cards with status badges, reorder button |
| 14 | OrderDetail | Full order info, timeline, invoice link |
| 15 | Invoices | List with PDF download icons |
| 16 | Wallet | Balance, transaction history |
| 17 | CreditStatement | Outstanding, limit, aging bars |
| 18 | Addresses | Saved addresses, add new, set default |
| 19 | Favorites | Favorite suppliers list |
| 20 | Profile | Name, phone, customer type, edit |
| 21 | Settings | Language toggle AR/EN, notifications |
| 22 | Support | FAQ accordion, create ticket, chat |

### Driver App (18 screens)

| # | Screen | Description |
|---|--------|-------------|
| 1 | Login | Phone + OTP (shared flow) |
| 2 | Home/Map | Online toggle top-right, earnings today |
| 3 | JobOffer | Bottom sheet, 30s countdown, accept/reject |
| 4 | ActiveJob | Order details, navigate button |
| 5 | Navigation | Google Maps turn-by-turn embedded |
| 6 | Filling | "Mark Filled" button, optional photo |
| 7 | POD | Camera, signature pad, OTP input |
| 8 | Signature | Full-screen signature canvas |
| 9 | CashCollect | Amount display, confirm collection |
| 10 | Earnings | Today/week/month tabs, chart |
| 11 | History | Completed jobs list |
| 12 | Schedule | Shift calendar |
| 13 | Documents | License, ID, expiry alerts |
| 14 | Profile | Personal details |
| 15 | Notifications | Job alerts, system messages |
| 16 | OfflineQueue | Pending uploads when offline |
| 17 | Settings | Language, notifications |
| 18 | Vehicle | Truck details, photos |

### Supplier Portal (25 screens)

Dashboard with KPI cards, order queue, fleet map, revenue chart, credit customers table, settlements, reports, branch management, water sources, maintenance calendar, employee list, pricing rules editor, settings.

### Admin Dashboard (30+ screens)

Live ops map, tenant management, user CRUD, order monitoring, pricing/commission rules, city/zone polygon editor, coupon management, analytics dashboards, accounting reports, dispute resolution, audit log viewer, CMS for FAQs/banners, notification templates, system settings.
