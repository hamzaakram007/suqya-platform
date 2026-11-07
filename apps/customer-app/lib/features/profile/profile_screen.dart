import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';
import '../../core/providers/locale_provider.dart';
import '../../core/services/customer_api.dart';

/// Account tab — profile + settings merged feel.
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  Map<String, dynamic>? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final p = await ref.read(customerApiProvider).getProfile();
      setState(() => _profile = p);
      final lang = p['preferredLanguage']?.toString() ??
          (p['profile'] as Map?)?['preferredLanguage']?.toString();
      if (lang != null) {
        await ref.read(localeProvider.notifier).syncFromProfile(lang);
      }
    } catch (_) {
      setState(() => _profile = null);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final locale = ref.watch(localeProvider);
    final name = _profile?['name']?.toString() ??
        _profile?['fullName']?.toString() ??
        l10n.defaultCustomerName;
    final phone = _profile?['phone']?.toString() ?? '';

    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          children: [
            Text(
              l10n.profile,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: t.text,
              ),
            ),
            const SizedBox(height: 20),
            if (_loading)
              const SqSkeleton(height: 88, radius: 16)
            else
              SqCard(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: t.primaryMuted,
                      child: Icon(Icons.person_rounded,
                          color: t.primary, size: 30),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: t.text,
                            ),
                          ),
                          if (phone.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Directionality(
                              textDirection: TextDirection.ltr,
                              child: Text(
                                phone,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: t.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
            Text(
              l10n.yourServices,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: t.textSecondary,
              ),
            ),
            const SizedBox(height: 10),
            _link(t, Icons.history_rounded, l10n.orders, '/orders'),
            _link(t, Icons.account_balance_wallet_outlined, l10n.wallet,
                '/wallet'),
            _link(t, Icons.location_on_outlined, l10n.addresses, '/addresses'),
            _link(t, Icons.receipt_long_outlined, l10n.invoices, '/invoices'),
            _link(t, Icons.credit_card_outlined, l10n.credit, '/credit'),
            _link(t, Icons.local_offer_outlined, l10n.coupons, '/coupons'),
            const SizedBox(height: 20),
            Text(
              l10n.helpAndSettings,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: t.textSecondary,
              ),
            ),
            const SizedBox(height: 10),
            _link(t, Icons.support_agent_outlined, l10n.support, '/support'),
            _link(t, Icons.help_outline, l10n.help, '/help'),
            SqCard(
              onTap: () {},
              child: Row(
                children: [
                  Icon(Icons.language, color: t.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      l10n.language,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: t.text,
                      ),
                    ),
                  ),
                  DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: locale.languageCode,
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
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            _link(t, Icons.info_outline, l10n.about, '/about'),
            const SizedBox(height: 16),
            SqButton(
              label: l10n.logout,
              variant: SqButtonVariant.danger,
              icon: Icons.logout_rounded,
              onPressed: () async {
                await ref.read(authSessionProvider.notifier).signOut();
                ref.read(authPhoneProvider.notifier).state = null;
                if (context.mounted) context.go('/login');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _link(SuqyaTheme t, IconData icon, String label, String path) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: SqCard(
        onTap: () => context.push(path),
        child: Row(
          children: [
            Icon(icon, color: t.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(fontWeight: FontWeight.w600, color: t.text),
              ),
            ),
            Icon(Icons.chevron_left, color: t.textSecondary),
          ],
        ),
      ),
    );
  }
}
