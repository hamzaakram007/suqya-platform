import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/driver_jobs.dart';

class DriverProfileScreen extends ConsumerWidget {
  const DriverProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final phone = ref.watch(authPhoneProvider);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: Text(l10n.profileShort)),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Center(
            child: CircleAvatar(
              radius: 44,
              backgroundColor: t.primaryMuted,
              child: Icon(Icons.person_rounded, size: 44, color: t.primary),
            ),
          ),
          const SizedBox(height: 12),
          if (phone != null)
            Text(
              phone,
              textAlign: TextAlign.center,
              textDirection: TextDirection.ltr,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: t.text,
              ),
            ),
          const SizedBox(height: 28),
          SqCard(
            onTap: () => context.push('/earnings'),
            child: Row(
              children: [
                Icon(Icons.payments_rounded, color: t.primary),
                const SizedBox(width: 12),
                Expanded(child: Text(l10n.earnings)),
                Icon(Icons.chevron_left, color: t.textSecondary),
              ],
            ),
          ),
          const SizedBox(height: 10),
          SqCard(
            onTap: () => context.push('/settings'),
            child: Row(
              children: [
                Icon(Icons.settings_rounded, color: t.primary),
                const SizedBox(width: 12),
                Expanded(child: Text(l10n.settings)),
                Icon(Icons.chevron_left, color: t.textSecondary),
              ],
            ),
          ),
          const SizedBox(height: 32),
          SqButton(
            label: l10n.logout,
            height: 56,
            variant: SqButtonVariant.danger,
            onPressed: () async {
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
