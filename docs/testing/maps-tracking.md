# Maps + live tracking

**Goal:** Replace `MapsStub` with a real map surface (Google when keyed, sandbox canvas otherwise) and close the live driver-point loop over Socket.io.

## Architecture

```
Driver app (GPS or sandbox walk)
  → POST /v1/drivers/location  (+ optional orderId)
  → TrackingService persists OrderTrackingPoint
  → Socket.io emit location_update → room order:{id}

Customer app TrackingScreen
  → connect ws {API_ORIGIN}/tracking (auth.token = JWT)
  → subscribe_order(orderId)
  → render SuqyaMap marker on location_update
  → REST GET /orders/:id/track as poll fallback (15s)
```

Namespace is **`/tracking`** (not under the HTTP `/v1` prefix).

| Socket event | Direction | Purpose |
|--------------|-----------|---------|
| `subscribe_order` | client → server | Join `order:{id}` (ACL: customer/driver/supplier/admin) |
| `driver_location` | driver → server | Persist + broadcast |
| `location_update` | server → room | Live lat/lng |
| `order_update` | server → room | Status fan-out helper |

## Env / dart-defines

| Name | Where | Purpose |
|------|-------|---------|
| `GOOGLE_MAPS_API_KEY` | Flutter `--dart-define` | Enables `GoogleMap` when `MAPS_MODE=auto\|google` |
| `MAPS_MODE` | Flutter `--dart-define` | `auto` (default) / `sandbox` / `google` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Admin/supplier Vercel (optional, future tiles) | Web Maps JS |
| `API_URL` / `TENANT_ID` | Flutter `--dart-define` | Existing API client + socket origin derivation |

Without a Google key, apps stay on the **sandbox canvas map** (Riyadh-centered grid + markers). Driver background location still walks/sandbox-pings so tracking UX works in demos.

## Flutter entry points

| Surface | Change |
|---------|--------|
| `packages/flutter_core` | `SuqyaMap`, `MapsConfig`, `TrackingSocket` |
| `apps/customer-app/.../tracking_screen.dart` | Live socket + map markers |
| `apps/driver-app/.../background_location.dart` | Geolocator or sandbox walk → REST + socket |
| Driver home / job detail / addresses | `SuqyaMap` instead of grey stub |

Platform folders (`android/` / `ios/`) are not yet in-repo — when scaffolding them, add the Google Maps API key to `AndroidManifest.xml` / `AppDelegate` in addition to `--dart-define`.

## Smoke

```bash
# API up + seeded (see foundation-e2e.md). Prefer an order in accepted|filling|in_transit.
API_BASE=http://localhost:4000/v1 npm run smoke:tracking

# Or pin an order:
TRACK_ORDER_ID=<uuid> API_BASE=http://localhost:4000/v1 npm run smoke:tracking
```

Unit: `npm run test -w @suqya/api` includes `tracking.service.spec.ts`.

## Blockers for production tiles

1. **`GOOGLE_MAPS_API_KEY`** (Maps SDK for Android/iOS + billing enabled; restrict by package/bundle)
2. Flutter `android/` / `ios` project generation with the Maps plugin registered
3. Live staging host (Railway) so mobile builds can point `API_URL` at a public API
