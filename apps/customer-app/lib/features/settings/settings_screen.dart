import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';
import '../../core/providers/locale_provider.dart';

/// Slim settings — primary prefs live on Account; this remains for deep link.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final locale = ref.watch(localeProvider);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(l10n.settings),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          SqCard(
            child: SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(
                l10n.pushNotifications,
                style: TextStyle(fontWeight: FontWeight.w600, color: t.text),
              ),
              subtitle: Text(
                l10n.pushNotificationsHint,
                style: TextStyle(color: t.textSecondary, fontSize: 13),
              ),
              value: true,
              activeTrackColor: t.primary,
              onChanged: (_) {},
            ),
          ),
          const SizedBox(height: 12),
          SqCard(
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    l10n.language,
                    style: TextStyle(fontWeight: FontWeight.w600, color: t.text),
                  ),
                ),
                DropdownButton<String>(
                  value: locale.languageCode,
                  underline: const SizedBox.shrink(),
                  items: [
                    DropdownMenuItem(
                      value: 'ar',
                      child: Text(l10n.languageAr),
                    ),
                    DropdownMenuItem(
                      value: 'en',
                      child: Text(l10n.languageEn),
                    ),
                  ],
                  onChanged: (v) {
                    if (v != null) {
                      ref.read(localeProvider.notifier).setLocale(v);
                    }
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SqCard(
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    l10n.appearance,
                    style: TextStyle(fontWeight: FontWeight.w600, color: t.text),
                  ),
                ),
                DropdownButton<ThemeMode>(
                  value: ref.watch(themeModeProvider),
                  underline: const SizedBox.shrink(),
                  items: [
                    DropdownMenuItem(
                      value: ThemeMode.system,
                      child: Text(l10n.themeSystem),
                    ),
                    DropdownMenuItem(
                      value: ThemeMode.light,
                      child: Text(l10n.themeLight),
                    ),
                    DropdownMenuItem(
                      value: ThemeMode.dark,
                      child: Text(l10n.themeDark),
                    ),
                  ],
                  onChanged: (v) {
                    if (v != null) {
                      ref.read(themeModeProvider.notifier).setMode(v);
                    }
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SqCard(
            child: SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(
                l10n.biometricUnlock,
                style: TextStyle(fontWeight: FontWeight.w600, color: t.text),
              ),
              subtitle: Text(
                l10n.biometricUnlockHint,
                style: TextStyle(color: t.textSecondary, fontSize: 13),
              ),
              value: false,
              activeTrackColor: t.primary,
              onChanged: (_) async {
                await const BiometricGate().authenticate();
              },
            ),
          ),
          const SizedBox(height: 24),
          SqButton(
            label: l10n.logout,
            variant: SqButtonVariant.danger,
            onPressed: () async {
              await ref.read(authSessionProvider.notifier).signOut();
              ref.read(authPhoneProvider.notifier).state = null;
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}
