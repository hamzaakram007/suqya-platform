import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/customer_api.dart';

const _localePrefKey = 'preferred_locale';

final localeProvider = NotifierProvider<LocaleNotifier, Locale>(
  LocaleNotifier.new,
);

class LocaleNotifier extends Notifier<Locale> {
  @override
  Locale build() {
    _restore();
    return const Locale('ar');
  }

  Future<void> _restore() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_localePrefKey);
    if (code == 'en' || code == 'ar') {
      state = Locale(code);
    }
  }

  Future<void> setLocale(String languageCode, {bool syncApi = true}) async {
    if (languageCode != 'ar' && languageCode != 'en') return;
    final next = Locale(languageCode);
    if (state == next) return;

    state = next;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_localePrefKey, languageCode);

    if (syncApi) {
      try {
        await ref.read(customerApiProvider).updateLanguage(languageCode);
      } catch (_) {
        // Local switch still applies; server sync can retry later.
      }
    }
  }

  Future<void> syncFromProfile(String? preferredLanguage) async {
    if (preferredLanguage != 'ar' && preferredLanguage != 'en') return;
    await setLocale(preferredLanguage!, syncApi: false);
  }
}
