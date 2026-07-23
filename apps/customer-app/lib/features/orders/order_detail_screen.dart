import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/l10n/order_status.dart';
import '../../core/services/customer_api.dart';

class OrderDetailScreen extends ConsumerStatefulWidget {
  const OrderDetailScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  Map<String, dynamic>? _order;
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
      final order =
          await ref.read(customerApiProvider).getOrder(widget.orderId);
      setState(() => _order = order);
    } catch (e) {
      setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _loading = false);
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
        title: Text(l10n.orderDetail),
        actions: [
          IconButton(
            icon: const Icon(Icons.near_me_outlined),
            onPressed: () => context.push('/tracking/${widget.orderId}'),
          ),
        ],
      ),
      body: _loading
          ? const Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                children: [
                  SqSkeleton(height: 140, radius: 16),
                  SizedBox(height: 12),
                  SqSkeleton(height: 80, radius: 16),
                ],
              ),
            )
          : _error != null
              ? SqErrorState(message: l10n.errorLoad, onRetry: _load)
              : _order == null
                  ? SqEmpty(
                      title: l10n.noData,
                      subtitle: '',
                    )
                  : _buildBody(l10n, t, _order!),
    );
  }

  Widget _buildBody(
    AppLocalizations l10n,
    SuqyaTheme t,
    Map<String, dynamic> order,
  ) {
    final tank = order['tankSize'] as Map<String, dynamic>?;
    final address = order['address'] as Map<String, dynamic>?;
    final amount = order['totalAmount']?.toString();
    final status = order['status']?.toString() ?? '—';
    final tankName =
        tank?['name']?.toString() ?? tank?['nameAr']?.toString() ?? '—';
    final paymentType = order['paymentType']?.toString() ?? '—';

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
      children: [
        SqCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.orderNumber(order['id']?.toString() ?? ''),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: t.text,
                ),
              ),
              const SizedBox(height: 16),
              _row(t, l10n.labelStatus, localizedListStatus(l10n, status)),
              _row(t, l10n.labelSize, tankName),
              _row(t, l10n.labelPayment, paymentLabel(l10n, paymentType)),
              if (amount != null) _row(t, l10n.labelTotal, l10n.sar(amount)),
            ],
          ),
        ),
        if (address != null) ...[
          const SizedBox(height: 12),
          SqCard(
            child: Row(
              children: [
                Icon(Icons.location_on_rounded, color: t.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.deliveryAddress,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: t.text,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${address['street'] ?? ''} ${address['buildingNumber'] ?? ''}',
                        style: TextStyle(color: t.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 12),
        SqCard(
          child: Column(
            children: [
              Text(
                l10n.zatcaInvoice,
                style: TextStyle(fontWeight: FontWeight.w700, color: t.text),
              ),
              const SizedBox(height: 16),
              Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  color: t.primaryMuted,
                  borderRadius: BorderRadius.circular(t.radiusMd),
                  border: Border.all(color: t.border),
                ),
                child:
                    Icon(Icons.qr_code_2_rounded, size: 96, color: t.primary),
              ),
              const SizedBox(height: 12),
              Text(
                l10n.scanQrHint,
                style: TextStyle(fontSize: 13, color: t.textSecondary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        SqButton(
          label: l10n.trackOrder,
          icon: Icons.near_me,
          onPressed: () => context.push('/tracking/${widget.orderId}'),
        ),
      ],
    );
  }

  Widget _row(SuqyaTheme t, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Text(label, style: TextStyle(color: t.textSecondary)),
          const Spacer(),
          Text(
            value,
            style: TextStyle(fontWeight: FontWeight.w600, color: t.text),
          ),
        ],
      ),
    );
  }
}
