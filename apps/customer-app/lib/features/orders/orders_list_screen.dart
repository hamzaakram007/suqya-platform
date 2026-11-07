import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/l10n/order_status.dart';
import '../../core/services/customer_api.dart';

class OrdersListScreen extends ConsumerStatefulWidget {
  const OrdersListScreen({super.key});

  @override
  ConsumerState<OrdersListScreen> createState() => _OrdersListScreenState();
}

class _OrdersListScreenState extends ConsumerState<OrdersListScreen> {
  List<dynamic> _orders = [];
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
      final orders = await ref.read(customerApiProvider).getOrders();
      setState(() => _orders = orders);
    } catch (e) {
      setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _statusLabel(String status) {
    return localizedListStatus(AppLocalizations.of(context)!, status);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(l10n.orders),
      ),
      body: _loading
          ? ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: 4,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, __) => const SqSkeleton(height: 96, radius: 16),
            )
          : _error != null
              ? SqErrorState(
                  message: l10n.errorLoadOrders,
                  onRetry: _load,
                )
              : _orders.isEmpty
                  ? SqEmpty(
                      title: l10n.noOrders,
                      subtitle: l10n.noOrdersHint,
                      actionLabel: l10n.orderNow,
                      onAction: () => context.go('/home'),
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                        itemCount: _orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, i) {
                          final order = _orders[i] as Map<String, dynamic>;
                          final id = order['id']?.toString() ?? '';
                          final status = order['status']?.toString() ?? '';
                          final tank =
                              order['tankSize'] as Map<String, dynamic>?;
                          final amount = order['totalAmount']?.toString();
                          return SqCard(
                            onTap: () => context.push('/orders/$id'),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: t.primaryMuted,
                                    borderRadius:
                                        BorderRadius.circular(t.radiusMd),
                                  ),
                                  child: Icon(Icons.local_shipping_rounded,
                                      color: t.primary),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tank?['name']?.toString() ??
                                            tank?['nameAr']?.toString() ??
                                            l10n.waterOrder,
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                          color: t.text,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        _statusLabel(status),
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: t.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (amount != null)
                                  Text(
                                    l10n.sar(amount),
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: t.primary,
                                    ),
                                  ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
