# driver-app

Flutter app for Suqya. Native `android/` and `ios/` scaffolds are checked in.

- Org / ids: see `docs/deployment/publish-surfaces.md` (`sa.suqya.customer` / `sa.suqya.driver`)
- Compile-time config: copy `dart_defines.staging.example.json` → `dart_defines.staging.json` (gitignored)
- Build: `../../scripts/flutter-build-release.sh driver apk staging`

Do not commit Maps keys or signing material.
