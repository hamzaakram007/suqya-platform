# Customer App Manual

**Phase 14 · Sprint 11** — Guide for ordering water tankers via the Suqya customer app.

**App**: `apps/customer-app` (Flutter 3.x)  
**Platforms**: Android (Google Play), iOS (App Store)  
**API**: `apps/api` — customer endpoints under `/v1/orders/*`, `/v1/customers/*`  
**Languages**: Arabic (default), English — via `packages/i18n`

## Getting Started

### Installation

1. Download **Suqya** (سقيا) from Google Play or App Store
2. Open the app → swipe through onboarding screens (3 slides)
3. Enter your Saudi phone number (+966 5X XXX XXXX)
4. Enter the 6-digit OTP received via SMS
5. Complete your profile:
   - Full name
   - Default delivery address (map picker or National Address)
   - Language preference

No password required — login is always via OTP.

### Permissions

| Permission | Purpose | Required |
|------------|---------|----------|
| Location | Auto-detect delivery address | Recommended |
| Notifications | Order status updates, driver arrival | Yes |
| Camera | Scan supplier QR codes | Optional |

## Ordering Water — 3-Tap Flow

Suqya is designed for the fastest ordering experience:

### Tap 1: Order Now (اطلب الآن)

From the home screen:
- Your default address is pre-filled
- Last ordered tank size is shown
- Estimated price displayed (incl. 15% VAT)
- Tap **Order Now**

### Tap 2: Confirm (تأكيد)

Review and adjust:
- **Tank size** — 8,000L, 12,000L, 18,000L, 32,000L
- **Water type** — Potable (صالح للشرب), irrigation (ري), construction (بناء)
- **Delivery instructions** — gate code, contact person, notes
- **Schedule** — now or later (date/time picker)
- Tap **Confirm**

### Tap 3: Pay (ادفع)

Select payment method and confirm:

| Method | Description |
|--------|-------------|
| Cash (نقدي) | Pay driver on delivery |
| Card (بطاقة) | Pay now via Moyasar (mada, Visa, Mastercard) |
| Credit (آجل) | Deduct from credit account (B2B, if approved) |
| Wallet (محفظة) | Deduct from Suqya wallet balance |

Tap **Pay** → order is placed.

## Tracking Your Order

After placing an order, the tracking screen shows:

| Element | Description |
|---------|-------------|
| Status bar | Current status with Arabic label |
| Live map | Driver location in real time |
| ETA | Estimated arrival time |
| Driver info | Name, phone (call button), truck plate |
| Order details | Tank size, water type, amount |

### Order statuses

| Status | Arabic | What's Happening |
|--------|--------|-----------------|
| `pending` | قيد الانتظار | Finding a supplier for your order |
| `supplier_review` | مراجعة المورد | Supplier reviewing your order |
| `dispatching` | جاري التوصيل | Finding a driver |
| `accepted` | تم القبول | Driver accepted, heading to fill |
| `filling` | جاري التعبئة | Tank being filled |
| `in_transit` | في الطريق | Driver heading to you |
| `delivered` | تم التوصيل | Water delivered, POD submitted |
| `completed` | مكتمل | Payment confirmed, invoice generated |

### Delivery verification

When the driver arrives:
1. You receive a push notification: "Driver has arrived"
2. A **4-digit delivery code** appears in your app
3. Show the code to the driver for verification
4. Sign on the driver's device if requested

## Addresses

**Navigation**: Profile → Addresses (العناوين)

### Add address

1. Tap **Add Address** (إضافة عنوان)
2. Use map picker to pin location, or enter National Address fields:
   - Building number (رقم المبنى)
   - Street (الشارع)
   - District (الحي)
   - City (المدينة)
   - Postal code (الرمز البريدي)
3. Label: Home (المنزل), Work (العمل), Other
4. Save

### National Address (SPL)

Suqya supports Saudi National Address format per SPL standards. If you have a short address code, enter it for auto-fill.

## Payment

### Card payment (Moyasar)

1. Select **Card** at checkout
2. Redirected to Moyasar secure payment page
3. Enter card details (mada, Visa, or Mastercard)
4. Payment confirmed → redirected back to tracking screen
5. Tax invoice generated automatically

Your card details are never stored on Suqya servers.

### Cash on delivery

1. Select **Cash** at checkout
2. Prepare exact amount (shown in app)
3. Pay the driver when water is delivered
4. Driver confirms cash receipt in their app

### Credit (B2B)

For business customers:

1. **Apply**: Profile → Credit → Apply
   - Upload company CR
   - Request credit limit
2. **Wait for approval** (1–3 business days)
3. **Order on credit**: select Credit at checkout
4. **Pay later**: Profile → Credit → Pay Balance
5. **Monthly statement**: view aging (current, 30, 60, 90 days)

### Wallet

Top up your Suqya wallet for faster checkout:

1. Profile → Wallet → Top Up
2. Enter amount → pay via card
3. Use wallet balance at checkout

## Invoices

**Navigation**: Profile → Invoices (الفواتير)

Every completed order generates a ZATCA-compliant tax invoice:

| Feature | Description |
|---------|-------------|
| PDF download | Tap invoice → Download PDF |
| QR code | ZATCA TLV-encoded QR for verification |
| VAT breakdown | Subtotal + 15% VAT shown separately |
| Invoice number | Sequential (INV-00000001) |

B2B customers receive standard invoices (cleared in real-time with ZATCA).  
B2C customers receive simplified invoices (reported within 24 hours).

## Order History

**Navigation**: Home → History (السجل)

| Action | Description |
|--------|-------------|
| View details | Tap any past order |
| Reorder | Tap **Reorder** (إعادة الطلب) — pre-fills last configuration |
| Rate | Rate driver 1–5 stars after delivery |
| Dispute | Open dispute if delivery issue (within 48 hours) |

## Favorites & Reorder

- **Favorites**: save frequently used configurations (tank size + address + water type)
- **Reorder**: one tap from history or home screen
- Last order pre-fills on home screen for fastest repeat ordering

## Coupons

If you have a promotional code:

1. At checkout → tap **Coupon** (كوبون)
2. Enter code (e.g., RAMADAN2026)
3. Discount applied to total
4. VAT recalculated on discounted amount

## Notifications

You receive push notifications for:

| Event | Message Example |
|-------|----------------|
| Order accepted | "تم قبول طلبك — السائق في الطريق للتعبئة" |
| Driver en route | "السائق في الطريق إليك — الوصول خلال 25 دقيقة" |
| Driver arrived | "وصل السائق — رمز التسليم: 4821" |
| Delivery complete | "تم التوصيل بنجاح — شكراً لاستخدام سقيا" |
| Invoice ready | "فاتورتك الضريبية جاهزة للتحميل" |
| Credit reminder | "تذكير: رصيد الآجل مستحق خلال 3 أيام" |

Manage notification preferences in Profile → Settings.

## Profile & Settings

| Setting | Options |
|---------|---------|
| Language | العربية (default), English |
| Notifications | Push, SMS, email toggles |
| Privacy | Data export, deletion request (PDPL) |
| Payment methods | Saved cards (via Moyasar) |
| Support | Open ticket, call, WhatsApp |

### PDPL rights

Per Saudi Personal Data Protection Law:
- **Export your data**: Settings → Privacy → Export Data
- **Delete your account**: Settings → Privacy → Delete Account (30-day processing)
- **Consent management**: Settings → Privacy → Manage Consent

## Disputes

If something goes wrong with your delivery:

1. Order History → select order → **Report Issue** (بلاغ)
2. Select issue type:
   - Short delivery (كمية أقل)
   - Water quality issue
   - Late delivery
   - Driver behavior
   - Other
3. Add description and photos
4. Submit — admin reviews within 24 hours
5. Resolution: refund, redelivery, or dismissal

Disputes must be filed within 48 hours of delivery.

## Tips

1. **Save your address** — accurate National Address ensures faster delivery
2. **Use reorder** — fastest way to get water again
3. **Card payment** — skip cash handling, instant invoice
4. **Schedule ahead** — order for tomorrow during off-peak for lower prices
5. **Rate your driver** — helps improve service quality
6. **Check invoice** — all invoices are ZATCA-compliant for your tax records

## Pricing

Prices vary by:

| Factor | Impact |
|--------|--------|
| Tank size | 8,000L cheapest, 32,000L most expensive |
| Delivery zone | Remote areas may have surcharge |
| Time of day | Peak hours (10:00–14:00) may be higher |
| Water type | Potable vs. irrigation vs. construction |
| VAT | 15% added to all taxable supplies |

Price estimate shown before you confirm. Final price locked at order placement.

## Support

| Channel | Contact |
|---------|---------|
| In-app | Profile → Support → New Ticket |
| Phone | 920000000 (06:00–24:00 AST) |
| WhatsApp | +966 50 000 0000 |
| Email | support@suqya.sa |

## Related Documentation

- [Driver Manual](driver.md)
- [Supplier Manual](supplier.md)
- [User Journeys](../ux/user-journeys.md)
- [Compliance Matrix](../business/compliance-matrix.md)
