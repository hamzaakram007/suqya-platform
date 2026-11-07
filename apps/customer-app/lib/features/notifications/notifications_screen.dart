import 'package:flutter/material.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(l10n.notifications),
      ),
      body: SqEmpty(
        icon: Icons.notifications_none_outlined,
        title: l10n.emptyNotifications,
        subtitle: l10n.noData,
      ),
    );
  }
}
