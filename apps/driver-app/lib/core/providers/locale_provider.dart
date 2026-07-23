import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _prefsKey = 'driver_locale';

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier(this._ref) : super(const Locale('ar')) {
    _load();
  }

  final Ref _ref;

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_prefsKey) ?? 'ar';
    if (code == 'ar' || code == 'en') {
      state = Locale(code);
    }
  }

  Future<void> setLocale(Locale locale) async {
    if (locale.languageCode != 'ar' && locale.languageCode != 'en') return;
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, locale.languageCode);

    final session = _ref.read(authSessionProvider);
    final isAuth = session.maybeWhen(
      data: (s) => s.isAuthenticated,
      orElse: () => false,
    );
    if (isAuth) {
      try {
        await _ref.read(apiClientProvider).patch(
              '/users/me/language',
              data: {'preferredLanguage': locale.languageCode},
              options: Options(
                headers: {'Accept-Language': locale.languageCode},
              ),
            );
      } catch (_) {}
    }
  }
}

final localeProvider =
    StateNotifierProvider<LocaleNotifier, Locale>((ref) => LocaleNotifier(ref));
