/// Biometric unlock hook — wire `local_auth` in app layer when ready.
class BiometricGate {
  const BiometricGate();

  /// Returns true if device supports biometrics (stub: false until plugin added).
  Future<bool> get isAvailable async => false;

  /// Prompt Face ID / fingerprint. Stub always succeeds when unavailable.
  Future<bool> authenticate({String reason = 'فتح سقيا'}) async {
    if (!await isAvailable) return true;
    return true;
  }
}
