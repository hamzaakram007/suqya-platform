import 'package:flutter/material.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ScreenScaffold(
      title: l10n.about,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(Icons.water_drop,
                size: 80, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 16),
            Text(l10n.appTitle,
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(l10n.version),
            const SizedBox(height: 24),
            Text(
              l10n.aboutDescription,
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            Text(l10n.copyright),
          ],
        ),
      ),
    );
  }
}
