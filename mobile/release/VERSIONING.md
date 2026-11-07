# Flutter versioning notes

Both apps use pubspec SemVer + build number:

```yaml
version: 0.1.0+1
#         ^^^^^ ^^
#         name   build (monotonic integer for stores)
```

| Surface | Field |
|---------|-------|
| Android `versionName` | `0.1.0` |
| Android `versionCode` | `1` |
| iOS `CFBundleShortVersionString` | `0.1.0` |
| iOS `CFBundleVersion` | `1` |

## Rules

1. **Every store upload** must increase the build number (`+N`), even for the same marketing version.
2. Keep customer and driver build numbers independent, but bump both when `flutter_core` or the API contract changes in a release train.
3. Internal / TestFlight tracks may stay on `0.1.x` until public launch; public Play / App Store should match marketing (e.g. `1.0.0`).
4. Do not reuse a build number that was already uploaded to Play or App Store Connect.
5. Tag git when cutting a store candidate: `mobile-customer-0.1.0+12` / `mobile-driver-0.1.0+12` (optional convention).
