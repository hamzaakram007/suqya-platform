import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class RatingsScreen extends ConsumerStatefulWidget {
  const RatingsScreen({super.key});

  @override
  ConsumerState<RatingsScreen> createState() => _RatingsScreenState();
}

class _RatingsScreenState extends ConsumerState<RatingsScreen> {
  final _orderIdController = TextEditingController();
  int _score = 5;
  final _commentController = TextEditingController();
  bool _loading = false;

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    if (_orderIdController.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      await ref.read(customerApiProvider).rateOrder(
            _orderIdController.text.trim(),
            _score,
            comment: _commentController.text.isEmpty
                ? null
                : _commentController.text,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.thanksForRating)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.errorGeneric)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _orderIdController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ScreenScaffold(
      title: l10n.ratings,
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _orderIdController,
              decoration: InputDecoration(
                labelText: l10n.orderIdLabel,
                border: const OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            Text(l10n.ratingLabel),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) {
                return IconButton(
                  icon: Icon(i < _score ? Icons.star : Icons.star_border,
                      color: Colors.amber),
                  onPressed: () => setState(() => _score = i + 1),
                );
              }),
            ),
            TextField(
              controller: _commentController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: l10n.commentOptional,
                border: const OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(l10n.submitRating),
            ),
          ],
        ),
      ),
    );
  }
}
