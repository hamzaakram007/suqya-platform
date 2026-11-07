# Driver App Manual

**Phase 14 · Sprint 11** — Guide for water tanker drivers using the Suqya driver app.

**App**: `apps/driver-app` (Flutter 3.x)  
**Platforms**: Android (Google Play), iOS (App Store)  
**API**: `apps/api` — driver endpoints under `/v1/drivers/*`

## Getting Started

### Installation

1. Download **Suqya Driver** (سقيا سائق) from Google Play or App Store
2. Open the app → select language (العربية / English)
3. Enter your Saudi phone number (+966 5X XXX XXXX)
4. Enter the 6-digit OTP received via SMS
5. Your supplier assignment loads automatically

Your driver account is created by your supplier via the supplier portal. Contact your supplier manager if you cannot log in.

### Permissions

The app requires these permissions:

| Permission | Purpose | Required |
|------------|---------|----------|
| Location (Always) | Real-time tracking during deliveries | Yes |
| Camera | POD photos | Yes |
| Notifications | Job offers, order updates | Yes |
| Phone | Contact customer if needed | Optional |

**Android**: Disable battery optimization for Suqya Driver to maintain background location.  
**iOS**: Set location to "Always" in Settings → Suqya Driver → Location.

## Going Online

1. Open the app → tap **Go Online** (اتصل الآن) toggle
2. Your location starts broadcasting to the dispatch system
3. Status indicator turns green
4. You are now eligible to receive job offers

### Going offline

- Tap **Go Offline** (قطع الاتصال) when your shift ends
- You will not receive new job offers
- Complete any active delivery before going offline

## Receiving Job Offers

When a new order is dispatched to you:

1. **Push notification** with sound alert
2. **Offer screen** shows:
   - Tank size and water type
   - Pickup location (filling station)
   - Delivery address
   - Estimated earnings (SAR)
   - Countdown timer (30 seconds)
3. **Accept** or **Reject**

| Action | Result |
|--------|--------|
| Accept | Job assigned, navigation starts |
| Reject | Offer sent to next driver |
| Timeout (30s) | Treated as reject |

> Tip: Accept quickly during peak hours. High acceptance rate improves your dispatch priority.

## Delivery Workflow

### Step 1: Navigate to filling station

After accepting:
- Map shows route to assigned filling station
- Tap **Navigate** to open Google Maps/Waze
- Customer sees "Driver heading to fill tank" status

### Step 2: Fill tank

At the filling station:
1. Fill tank to ordered capacity
2. Tap **Tank Filled** (تم التعبئة)
3. Optional: take photo of filled tank
4. Status changes to `in_transit`

### Step 3: Navigate to customer

- Map shows route to customer delivery address
- Customer sees live tracking with ETA
- Your location updates every 10 seconds
- Call customer via in-app button if needed

### Step 4: Arrive and deliver

At customer location:
1. Tap **Arrived** (وصلت)
2. Complete delivery process

### Step 5: Proof of Delivery (POD)

Required for every delivery:

1. **Photo** — take photo of delivered water (tap camera icon)
2. **Customer signature** — customer signs on screen
3. **OTP verification** — ask customer for 4-digit delivery code (shown in their app)
4. Tap **Complete Delivery** (إتمام التوصيل)

POD data uploads to `ProofOfDelivery` table. If offline, uploads queue automatically when connectivity returns.

### Step 6: Payment collection

| Payment Method | Your Action |
|----------------|-------------|
| Cash | Collect amount shown → tap **Cash Received** (تم استلام النقد) |
| Card | Customer already paid via app — tap **Confirm Payment** |
| Credit | No collection needed — tap **Confirm** |
| Split (card + cash) | Collect cash portion only |

### Step 7: Complete

- Earnings updated in your profile
- Status returns to online
- Ready for next job offer

## Earnings

**Navigation**: Profile → Earnings

| Field | Description |
|-------|-------------|
| Today's earnings | Sum of completed deliveries today |
| This week | Weekly total |
| Per delivery | Base fee + distance bonus |
| Settlement | Paid to your supplier weekly |

Earnings breakdown per delivery:
- Base delivery fee
- Distance bonus (if > 15 km)
- Peak hour bonus (10:00–14:00, if applicable)

## Shift Management

**Navigation**: Profile → Shifts

| Feature | Description |
|---------|-------------|
| Start shift | Auto-recorded when you go online |
| End shift | Auto-recorded when you go offline |
| Shift history | View past shifts with delivery count and earnings |
| Break | Go offline temporarily (breaks don't count as shift time) |

## Offline Support

The driver app works with intermittent connectivity:

| Feature | Offline Behavior |
|---------|-----------------|
| Active job details | Cached locally |
| Navigation | Uses downloaded map tiles if available |
| POD upload | Queued, uploads when online |
| Location tracking | Buffered, syncs when online |
| Job offers | Requires connectivity |

## Vehicle & Documents

**Navigation**: Profile → My Truck

| Item | Details |
|------|---------|
| Assigned truck | Plate number, tank capacity |
| Water type | Type you're authorized to deliver |
| Documents | Your license, Istimara — must be current |

Contact your supplier if your truck assignment needs changing.

## Troubleshooting

### Not receiving job offers

1. Confirm you are **Online** (green indicator)
2. Check location permission is "Always"
3. Disable battery optimization (Android)
4. Ensure you have no active undelivered job
5. Contact supplier if issue persists

### Location not updating

1. Check GPS is enabled on phone
2. Ensure "Always" location permission
3. Restart the app
4. Move to area with clear sky (GPS needs satellite visibility)

### POD upload failed

- Photo uploads when connectivity returns automatically
- Do not delete the delivery — it is saved locally
- If stuck > 1 hour, contact support with order number

### App crash

1. Force close and reopen
2. Check for app update in store
3. Clear app cache (Settings → Apps → Suqya Driver → Clear Cache)
4. Reinstall if persistent (your account data is server-side)

### Wrong delivery address

1. Call customer via in-app phone button
2. Use customer's verbal directions
3. If address is fundamentally wrong, contact supplier to cancel

## Safety Guidelines

1. **Drive safely** — do not interact with the app while driving
2. **Secure load** — ensure tank is properly sealed before driving
3. **PPE** — wear safety gear at filling stations
4. **Spill protocol** — report water spills to supplier immediately
5. **Customer interaction** — remain professional; disputes go through the app

## Support

| Channel | Contact |
|---------|---------|
| In-app | Help → Report Issue |
| Supplier manager | Contact your assigned supplier |
| Platform support | 920000000 (06:00–24:00 AST) |

## Related Documentation

- [Supplier Manual](supplier.md)
- [Customer Manual](customer.md)
- [Troubleshooting](../operations/troubleshooting.md)
- [User Journeys](../ux/user-journeys.md)
