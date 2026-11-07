/// Google Maps / sandbox map configuration via `--dart-define`.
///
/// ```
/// flutter run \
///   --dart-define=API_URL=http://localhost:4000/v1 \
///   --dart-define=GOOGLE_MAPS_API_KEY=AIza... \
///   --dart-define=MAPS_MODE=auto
/// ```
///
/// Modes:
/// - `auto` (default): use Google Maps when [googleMapsApiKey] is non-empty, else sandbox
/// - `google`: force Google Maps (requires key + platform embeds)
/// - `sandbox`: force canvas map (no vendor key; tracking UX still works)
class MapsConfig {
  MapsConfig._();

  static const String googleMapsApiKey = String.fromEnvironment(
    'GOOGLE_MAPS_API_KEY',
    defaultValue: '',
  );

  static const String mapsMode = String.fromEnvironment(
    'MAPS_MODE',
    defaultValue: 'auto',
  );

  /// Riyadh downtown — sandbox default camera / GPS fallback.
  static const double sandboxLat = 24.7136;
  static const double sandboxLng = 46.6753;

  static bool get hasGoogleKey => googleMapsApiKey.trim().isNotEmpty;

  /// Whether the widget should mount a real [GoogleMap].
  static bool get useGoogleMaps {
    final mode = mapsMode.toLowerCase().trim();
    if (mode == 'sandbox') return false;
    if (mode == 'google') return hasGoogleKey;
    return hasGoogleKey;
  }

  static bool get isSandbox => !useGoogleMaps;
}
