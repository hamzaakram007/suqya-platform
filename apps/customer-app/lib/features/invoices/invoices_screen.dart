import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  List<dynamic> _invoices = [];
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
      final invoices = await ref.read(customerApiProvider).getInvoices();
      setState(() => _invoices = invoices);
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
      title: l10n.invoices,
      body: AsyncStateView<List<dynamic>>(
        isLoading: _loading,
        error: _error,
        data: _invoices,
        onRetry: _load,
        emptyMessage: l10n.noData,
        builder: (context, invoices) => ListView.builder(
          itemCount: invoices.length,
          itemBuilder: (_, i) {
            final inv = invoices[i] as Map<String, dynamic>;
            final number =
                inv['invoiceNumber']?.toString() ?? inv['id']?.toString() ?? '';
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: ListTile(
                leading: const Icon(Icons.receipt_long),
                title: Text(l10n.invoiceNumber(number)),
                subtitle: Text(inv['status']?.toString() ?? ''),
                trailing: Text(l10n.sar(
                    inv['totalAmount']?.toString() ??
                        inv['amount']?.toString() ??
                        '-')),
              ),
            );
          },
        ),
      ),
    );
  }
}
