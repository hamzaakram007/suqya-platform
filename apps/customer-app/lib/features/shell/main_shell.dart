import 'package:flutter/material.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:go_router/go_router.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: t.surface.withValues(alpha: 0.94),
          border: Border(top: BorderSide(color: t.border.withValues(alpha: 0.6))),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: NavigationBar(
              height: 64,
              backgroundColor: Colors.transparent,
              elevation: 0,
              indicatorColor: t.primaryMuted,
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: navigationShell.goBranch,
              labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
              destinations: [
                NavigationDestination(
                  icon: const Icon(Icons.water_drop_outlined),
                  selectedIcon: const Icon(Icons.water_drop),
                  label: l10n.homeTab,
                ),
                NavigationDestination(
                  icon: const Icon(Icons.near_me_outlined),
                  selectedIcon: const Icon(Icons.near_me),
                  label: l10n.trackTab,
                ),
                NavigationDestination(
                  icon: const Icon(Icons.person_outline),
                  selectedIcon: const Icon(Icons.person),
                  label: l10n.accountTab,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
