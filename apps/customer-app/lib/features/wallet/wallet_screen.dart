import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  Map<String, dynamic>? _wallet;
  bool _loading = true;
  bool _topping = false;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final wallet = await ref.read(customerApiProvider).getWallet();
      setState(() => _wallet = wallet);
    } catch (e) {
      setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _topUp() async {
    final l10n = AppLocalizations.of(context)!;
    setState(() => _topping = true);
    try {
      await ref.read(customerApiProvider).topUpWallet(100);
      await _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.topUpSuccess('100'))),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.errorTopUp)),
        );
      }
    } finally {
      if (mounted) setState(() => _topping = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(l10n.wallet),
      ),
      body: _loading
          ? const Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                children: [
                  SqSkeleton(height: 180, radius: 24),
                  SizedBox(height: 16),
                  SqSkeleton(height: 64, radius: 16),
                  SizedBox(height: 10),
                  SqSkeleton(height: 64, radius: 16),
                ],
              ),
            )
          : _error != null
              ? SqErrorState(message: l10n.errorLoadWallet, onRetry: _load)
              : _buildBody(l10n, t),
    );
  }

  Widget _buildBody(AppLocalizations l10n, SuqyaTheme t) {
    final wallet = _wallet ?? {};
    final balance = wallet['balance']?.toString() ?? '0';
    final ledger = (wallet['ledger'] as List?) ??
        (wallet['transactions'] as List?) ??
        [];

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(t.radiusXl),
              gradient: LinearGradient(
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
                colors: [t.primary, t.primaryDark],
              ),
              boxShadow: [
                BoxShadow(
                  color: t.primary.withValues(alpha: 0.28),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.balance,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  l10n.sar(balance),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 40,
                    fontWeight: FontWeight.w800,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 20),
                SqButton(
                  label: l10n.topUp,
                  onPressed: _topping ? null : _topUp,
                  loading: _topping,
                  variant: SqButtonVariant.secondary,
                  height: 48,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            l10n.recentActivity,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: t.text,
            ),
          ),
          const SizedBox(height: 12),
          if (ledger.isEmpty)
            SqEmpty(
              icon: Icons.receipt_long_outlined,
              title: l10n.noData,
              subtitle: l10n.emptyWalletActivity,
            )
          else
            ...ledger.map((raw) {
              final tx = raw as Map<String, dynamic>;
              final amount = (tx['amount'] as num?)?.toDouble() ?? 0;
              final positive = amount >= 0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SqCard(
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: positive
                              ? t.success.withValues(alpha: 0.12)
                              : t.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(t.radiusMd),
                        ),
                        child: Icon(
                          positive
                              ? Icons.arrow_downward_rounded
                              : Icons.arrow_upward_rounded,
                          color: positive ? t.success : t.error,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          tx['description']?.toString() ??
                              tx['type']?.toString() ??
                              l10n.transactionFallback,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: t.text,
                          ),
                        ),
                      ),
                      Text(
                        '${positive ? '+' : ''}${l10n.sar(tx['amount']?.toString() ?? '0')}',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: positive ? t.success : t.error,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}
