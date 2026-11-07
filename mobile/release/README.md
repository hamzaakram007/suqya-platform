# Mobile release helpers

Helpers for customer + driver store builds. **No credentials. No claim that apps are in stores.**

## Current repo state

- Dart sources live under `apps/customer-app` and `apps/driver-app`.
- Native `android/` and `ios/` trees are **not** checked in yet — generate with `flutter create .` (see [`docs/deployment/publish-surfaces.md`](../../docs/deployment/publish-surfaces.md)).
- Compile-time API/Maps config: `--dart-define-from-file` using the `dart_defines.*.example.json` files beside each app.

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
