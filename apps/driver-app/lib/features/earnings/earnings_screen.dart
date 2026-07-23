import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/driver_api.dart';

class EarningsScreen extends ConsumerStatefulWidget {
  const EarningsScreen({super.key});

  @override
  ConsumerState<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends ConsumerState<EarningsScreen> {
  Map<String, dynamic>? _earnings;
  bool _loading = true;
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
      final data = await ref.read(driverApiProvider).getEarnings();
      setState(() => _earnings = data);
    } catch (e) {
      setState(() => _error = e);
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: Text(l10n.earnings)),
      body: _loading
          ? const Padding(
              padding: EdgeInsets.all(24),
              child: Column(
                children: [
                  SqSkeleton(height: 120),
                  SizedBox(height: 16),
                  SqSkeleton(height: 72),
                  SizedBox(height: 12),
                  SqSkeleton(height: 72),
                ],
              ),
            )
          : _error != null
              ? SqErrorState(
                  message: _error.toString(),
                  onRetry: _load,
                )
              : _buildBody(t, l10n),
    );
  }

  Widget _buildBody(SuqyaTheme t, AppLocalizations l10n) {
    final data = _earnings ?? {};
    final total = data['total'] ?? 0;
    final today = data['today'] ?? total;
    final items = (data['earnings'] as List?) ?? [];

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          SqCard(
            padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
            child: Column(
              children: [
                Text(
                  l10n.today,
                  style: TextStyle(fontSize: 14, color: t.textSecondary),
                ),
                const SizedBox(height: 8),
                Text(
                  today.toString(),
                  style: TextStyle(
                    fontSize: 56,
                    fontWeight: FontWeight.w800,
                    color: t.primary,
                    height: 1,
                  ),
                ),
                Text(
                  l10n.currencySar,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: t.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: SqKpi(
                  label: l10n.total,
                  value: l10n.earningsAmount(total.toString()),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SqKpi(
                  label: l10n.trips,
                  value: '${items.length}',
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            l10n.details,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: t.text,
            ),
          ),
          const SizedBox(height: 12),
          if (items.isEmpty)
            SqEmpty(
              title: l10n.noEarningsTitle,
              subtitle: l10n.noEarningsSubtitle,
              icon: Icons.payments_outlined,
            )
          else
            ...items.map((raw) {
              final e = raw as Map<String, dynamic>;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SqCard(
                  child: Row(
                    children: [
                      Icon(Icons.local_shipping_rounded, color: t.primary),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          l10n.orderLabel('${e['orderId'] ?? ''}'),
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: t.text,
                          ),
                        ),
                      ),
                      Text(
                        l10n.earningsAmount('${e['amount'] ?? 0}'),
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: t.primary,
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
