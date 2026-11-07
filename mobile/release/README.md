# Mobile release helpers

Helpers for customer + driver store builds. **No credentials. No claim that apps are in stores.**

## Current repo state

- Dart sources + checked-in native `android/` and `ios/` under `apps/customer-app` and `apps/driver-app`.
- Application / bundle ids: `sa.suqya.customer` / `sa.suqya.driver`.
- Compile-time API/Maps config: `--dart-define-from-file` using the `dart_defines.*.example.json` files beside each app.
- Staging examples point at live Railway host `https://api-production-e8c4a.up.railway.app/v1` + `default-tenant` (Maps key empty / sandbox).
- IPA requires macOS + Xcode; Linux agents can produce APK/AAB only.

## Build

```bash
# 1) Scaffold native projects once
cd apps/customer-app && flutter create . --org sa.suqya --project-name suqya_customer
cd ../driver-app && flutter create . --org sa.suqya --project-name suqya_driver

# 2) Fill real defines (gitignored)
cp apps/customer-app/dart_defines.production.example.json \
   apps/customer-app/dart_defines.production.json
# edit REPLACE_* placeholders

# 3) Build
./scripts/flutter-build-release.sh customer android production
./scripts/flutter-build-release.sh driver ios production
```

## Fastlane stubs

Templates in `fastlane/` are **examples**. After `flutter create`, copy into each app’s `android/fastlane` or `ios/fastlane` and fill Appfile with real package/bundle ids and team ids — never commit API keys or `.p8` files.

## Versioning

See [VERSIONING.md](./VERSIONING.md).
