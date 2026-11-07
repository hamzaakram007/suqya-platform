import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class CouponsScreen extends ConsumerStatefulWidget {
  const CouponsScreen({super.key});

  @override
  ConsumerState<CouponsScreen> createState() => _CouponsScreenState();
}

class _CouponsScreenState extends ConsumerState<CouponsScreen> {
  final _codeController = TextEditingController();
  Map<String, dynamic>? _result;
  String? _error;
  bool _loading = false;

  Future<void> _validate() async {
    final l10n = AppLocalizations.of(context)!;
    setState(() {
      _loading = true;
      _error = null;
      _result = null;
    });
    try {
      final result = await ref.read(customerApiProvider).validateCoupon(
            _codeController.text.trim(),
            200,
          );
      setState(() => _result = result);
    } catch (e) {
      if (mounted) {
        setState(() => _error = l10n.errorGeneric);
      }
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ScreenScaffold(
      title: l10n.coupons,
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _codeController,
              decoration: InputDecoration(
                labelText: l10n.couponCodeLabel,
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.local_offer),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loading ? null : _validate,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(l10n.validateCoupon),
            ),
            const SizedBox(height: 24),
            if (_error != null)
              Text(_error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
            if (_result != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Icon(Icons.check_circle,
                          color: Colors.green, size: 48),
                      const SizedBox(height: 8),
                      Text(l10n.couponValid(
                          _result!['code']?.toString() ??
                              _codeController.text)),
                      if (_result!['discountAmount'] != null)
                        Text(l10n.discountAmount(
                            _result!['discountAmount'].toString())),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
