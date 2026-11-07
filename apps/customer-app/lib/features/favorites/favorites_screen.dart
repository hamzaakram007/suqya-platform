import 'package:flutter/material.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ScreenScaffold(
      title: l10n.favorites,
      body: SqEmpty(
        icon: Icons.favorite_border,
        title: l10n.emptyFavorites,
        subtitle: l10n.noData,
      ),
    );
  }
}
