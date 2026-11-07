# Mobile release helpers

Helpers for customer + driver store builds. **No credentials. No claim that apps are in stores.**

## Current repo state

- Dart + native `android/` / `ios/` under `apps/customer-app` and `apps/driver-app` (package / bundle ids `sa.suqya.customer` / `sa.suqya.driver`).
- Compile-time API/Maps config: `--dart-define-from-file` using the `dart_defines.*.example.json` files beside each app.
- Release signing: optional local `android/key.properties` (gitignored). Without it, Gradle falls back to **debug** signing — fine for local smoke, **rejected by Play**.

## Upload keystore (Play)

```bash
./scripts/android-create-upload-keystore.sh customer
./scripts/android-create-upload-keystore.sh driver
# Edit apps/*/android/key.properties; back up ~/suqya-keys/*.jks offline
```

Example template: [`android/key.properties.example`](./android/key.properties.example).

## Build

```bash
# Fill real defines (gitignored)
cp apps/customer-app/dart_defines.staging.example.json \
   apps/customer-app/dart_defines.staging.json
# edit REPLACE_* / fill API_URL + TENANT_ID

./scripts/flutter-build-release.sh customer android staging
./scripts/flutter-build-release.sh driver android staging
# iOS requires macOS + Xcode:
./scripts/flutter-build-release.sh customer ios staging
```

## Fastlane stubs

Templates in `fastlane/` are **examples**. Copy into each app’s `android/fastlane` or `ios/fastlane` and fill Appfile with real package/bundle ids and team ids — never commit API keys or `.p8` files.

## Versioning

See [VERSIONING.md](./VERSIONING.md).
