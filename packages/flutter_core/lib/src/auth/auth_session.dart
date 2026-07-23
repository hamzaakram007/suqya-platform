import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'secure_token_storage.dart';

final secureTokenStorageProvider = Provider<SecureTokenStorage>(
  (ref) => SecureTokenStorage(),
);

class AuthSession {
  AuthSession({required this.accessToken, this.refreshToken});

  final String? accessToken;
  final String? refreshToken;

  bool get isAuthenticated => accessToken != null && accessToken!.isNotEmpty;
}

class AuthSessionNotifier extends StateNotifier<AsyncValue<AuthSession>> {
  AuthSessionNotifier(this._storage) : super(const AsyncValue.loading()) {
    _load();
  }

  final SecureTokenStorage _storage;

  Future<void> _load() async {
    try {
      final access = await _storage.getAccessToken();
      final refresh = await _storage.getRefreshToken();
      state = AsyncValue.data(
        AuthSession(accessToken: access, refreshToken: refresh),
      );
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> setTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await _storage.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
    state = AsyncValue.data(
      AuthSession(accessToken: accessToken, refreshToken: refreshToken),
    );
  }

  Future<void> signOut() async {
    await _storage.clear();
    state = const AsyncValue.data(AuthSession(accessToken: null));
  }

  String? get accessToken =>
      state.maybeWhen(data: (s) => s.accessToken, orElse: () => null);
}

final authSessionProvider =
    StateNotifierProvider<AuthSessionNotifier, AsyncValue<AuthSession>>(
  (ref) => AuthSessionNotifier(ref.watch(secureTokenStorageProvider)),
);

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authSessionProvider).maybeWhen(
        data: (s) => s.isAuthenticated,
        orElse: () => false,
      );
});
