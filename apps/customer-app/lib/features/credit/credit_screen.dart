import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class CreditScreen extends ConsumerStatefulWidget {
  const CreditScreen({super.key});

  @override
  ConsumerState<CreditScreen> createState() => _CreditScreenState();
}

class _CreditScreenState extends ConsumerState<CreditScreen> {
  Map<String, dynamic>? _statement;
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
      final statement = await ref.read(customerApiProvider).getCreditStatement();
      setState(() => _statement = statement);
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
      title: l10n.credit,
      body: AsyncStateView<Map<String, dynamic>>(
        isLoading: _loading,
        error: _error,
        data: _statement,
        onRetry: _load,
        builder: (context, statement) {
          final entries = (statement['entries'] as List?) ??
              (statement['transactions'] as List?) ??
              [];
          return Column(
            children: [
              Card(
                margin: const EdgeInsets.all(16),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _stat(l10n.creditLimit,
                          statement['creditLimit']?.toString() ?? '-'),
                      _stat(l10n.creditUsed,
                          statement['usedAmount']?.toString() ??
                              statement['balance']?.toString() ??
                              '-'),
                      _stat(l10n.creditAvailable,
                          statement['availableCredit']?.toString() ?? '-'),
                    ],
                  ),
                ),
              ),
              Expanded(
                child: entries.isEmpty
                    ? Center(child: Text(l10n.noData))
                    : ListView.builder(
                        itemCount: entries.length,
                        itemBuilder: (_, i) {
                          final e = entries[i] as Map<String, dynamic>;
                          return ListTile(
                            title: Text(e['description']?.toString() ??
                                e['type']?.toString() ??
                                ''),
                            trailing: Text(l10n.sar(e['amount']?.toString() ?? '0')),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _stat(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 12)),
        Text(value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
