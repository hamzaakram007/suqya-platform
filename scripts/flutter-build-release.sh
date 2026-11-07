#!/usr/bin/env bash
# Build customer or driver release artifacts with dart-define-from-file.
# Usage:
#   ./scripts/flutter-build-release.sh <customer|driver> <android|ios|apk> <staging|production>
# Prerequisites: Flutter SDK; android/ios folders (run `flutter create .` first).
# Does not upload to stores and does not invent API URLs.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${1:-}"
TARGET="${2:-}"
ENV_NAME="${3:-production}"

usage() {
  echo "Usage: $0 <customer|driver> <android|ios|apk> <staging|production>" >&2
  exit 1
}

[[ "$APP" == "customer" || "$APP" == "driver" ]] || usage
[[ "$TARGET" == "android" || "$TARGET" == "ios" || "$TARGET" == "apk" ]] || usage
[[ "$ENV_NAME" == "staging" || "$ENV_NAME" == "production" ]] || usage

APP_DIR="$ROOT/apps/${APP}-app"
DEFINES_LOCAL="$APP_DIR/dart_defines.${ENV_NAME}.json"
DEFINES_EXAMPLE="$APP_DIR/dart_defines.${ENV_NAME}.example.json"

if [[ ! -d "$APP_DIR" ]]; then
  echo "Missing app dir: $APP_DIR" >&2
  exit 1
fi

if [[ ! -d "$APP_DIR/android" && ! -d "$APP_DIR/ios" ]]; then
  echo "Native projects missing under $APP_DIR." >&2
  echo "Run: cd $APP_DIR && flutter create . --org sa.suqya" >&2
  exit 1
fi

if [[ ! -f "$DEFINES_LOCAL" ]]; then
  echo "Missing $DEFINES_LOCAL" >&2
  echo "Copy $DEFINES_EXAMPLE → dart_defines.${ENV_NAME}.json and replace REPLACE_* placeholders with real values." >&2
  exit 1
fi

if grep -q 'REPLACE' "$DEFINES_LOCAL"; then
  echo "Refusing to build: $DEFINES_LOCAL still contains REPLACE placeholders." >&2
  exit 1
fi

if ! command -v flutter >/dev/null 2>&1; then
  echo "flutter not found on PATH" >&2
  exit 1
fi

cd "$APP_DIR"
echo "==> flutter pub get ($APP / $ENV_NAME)"
flutter pub get

case "$TARGET" in
  android)
    echo "==> flutter build appbundle --release"
    flutter build appbundle --release --dart-define-from-file="$DEFINES_LOCAL"
    echo "AAB: $APP_DIR/build/app/outputs/bundle/release/app-release.aab"
    ;;
  apk)
    echo "==> flutter build apk --release"
    flutter build apk --release --dart-define-from-file="$DEFINES_LOCAL"
    echo "APK: $APP_DIR/build/app/outputs/flutter-apk/app-release.apk"
    ;;
  ios)
    echo "==> flutter build ipa --release"
    flutter build ipa --release --dart-define-from-file="$DEFINES_LOCAL"
    echo "IPA under $APP_DIR/build/ios/ipa/ (requires macOS + signing)"
    ;;
esac
