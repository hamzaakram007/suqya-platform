import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/providers/locale_provider.dart';
import '../../core/services/background_location.dart';
import '../../core/services/offline_queue.dart';
import '../../core/services/driver_jobs.dart';

class DriverSettingsScreen extends ConsumerWidget {
  const DriverSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final location = ref.watch(backgroundLocationProvider);
    final queue = ref.watch(offlineQueueProvider);
    final locale = ref.watch(localeProvider);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: Text(l10n.settings)),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          SqCard(
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    l10n.language,
                    style:
                        TextStyle(fontWeight: FontWeight.w600, color: t.text),
                  ),
                ),
                DropdownButton<String>(
                  value: locale.languageCode,
                  underline: const SizedBox.shrink(),
                  items: [
                    DropdownMenuItem(
                      value: 'ar',
                      child: Text(l10n.languageArabic),
                    ),
                    DropdownMenuItem(
                      value: 'en',
                      child: Text(l10n.languageEnglish),
                    ),
                  ],
                  onChanged: (v) {
                    if (v != null) {
                      ref.read(localeProvider.notifier).setLocale(Locale(v));
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
              title: Text(l10n.locationTracking),
              subtitle: Text(
                location.isRunning ? l10n.active : l10n.stopped,
              ),
              value: location.isRunning,
              activeColor: t.primary,
              onChanged: (v) {
                if (v) {
                  location.start();
                } else {
                  location.stop();
                }
              },
            ),
          ),
          const SizedBox(height: 12),
          SqCard(
            child: Row(
              children: [
                Icon(Icons.cloud_off_rounded, color: t.warning),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.offlineQueue,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        l10n.pendingActions(queue.length),
                        style: TextStyle(fontSize: 13, color: t.textSecondary),
                      ),
                    ],
                  ),
                ),
                if (queue.isNotEmpty)
                  TextButton(
                    onPressed: () =>
                        ref.read(offlineQueueProvider.notifier).flush(),
                    child: Text(l10n.sync),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          SqButton(
            label: l10n.logout,
            height: 56,
            variant: SqButtonVariant.danger,
            onPressed: () async {
              location.stop();
              await ref.read(authSessionProvider.notifier).signOut();
              ref.read(authPhoneProvider.notifier).state = null;
              ref.read(isOnlineProvider.notifier).state = false;
              ref.read(activeJobIdProvider.notifier).state = null;
              ref.read(activeJobOfferProvider.notifier).state = null;
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}
