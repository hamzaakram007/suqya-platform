import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class RecurringOrdersScreen extends ConsumerStatefulWidget {
  const RecurringOrdersScreen({super.key});

  @override
  ConsumerState<RecurringOrdersScreen> createState() =>
      _RecurringOrdersScreenState();
}

class _RecurringOrdersScreenState extends ConsumerState<RecurringOrdersScreen> {
  Map<String, dynamic>? _subscription;
  List<dynamic> _plans = [];
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
      final api = ref.read(customerApiProvider);
      final sub = await api.getSubscription();
      final plans = await api.getSubscriptionPlans();
      setState(() {
        _subscription = sub;
        _plans = plans;
      });
    } catch (e) {
      setState(() => _error = e);
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ScreenScaffold(
      title: l10n.recurringOrders,
      body: AsyncStateView<Map<String, dynamic>>(
        isLoading: _loading,
        error: _error,
        data: _subscription ?? (_plans.isNotEmpty ? {'plans': _plans} : null),
        onRetry: _load,
        builder: (context, data) {
          if (_subscription != null && _subscription!['id'] != null) {
            final plan = _subscription!['plan'] as Map<String, dynamic>?;
            final planName = plan?['name']?.toString() ??
                plan?['nameAr']?.toString() ??
                _subscription!['planId']?.toString() ??
                '';
            final frequency =
                _subscription!['frequency']?.toString() ?? l10n.frequencyWeekly;
            return Card(
              margin: const EdgeInsets.all(16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l10n.activeSubscription,
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text(l10n.planLabel(planName)),
                    Text(l10n.frequencyLabel(frequency)),
                  ],
                ),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _plans.length,
            itemBuilder: (_, i) {
              final plan = _plans[i] as Map<String, dynamic>;
              final name = plan['name']?.toString() ??
                  plan['nameAr']?.toString() ??
                  '';
              return Card(
                child: ListTile(
                  leading: const Icon(Icons.repeat),
                  title: Text(name),
                  subtitle: Text(
                      '${plan['price'] ?? '-'} / ${plan['interval'] ?? l10n.perMonth}'),
                  trailing: const Icon(Icons.chevron_left),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
