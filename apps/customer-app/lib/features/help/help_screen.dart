import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class HelpScreen extends ConsumerStatefulWidget {
  const HelpScreen({super.key});

  @override
  ConsumerState<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends ConsumerState<HelpScreen> {
  List<dynamic> _faqs = [];
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
      final faqs = await ref.read(customerApiProvider).getFaqs();
      setState(() => _faqs = faqs);
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
        title: Text(l10n.help),
      ),
      body: _loading
          ? ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: 4,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, __) => const SqSkeleton(height: 64, radius: 16),
            )
          : _error != null
              ? SqErrorState(message: l10n.errorLoadFaqs, onRetry: _load)
              : _faqs.isEmpty
                  ? SqEmpty(
                      icon: Icons.help_outline,
                      title: l10n.emptyFaqs,
                      subtitle: l10n.noData,
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _faqs.length,
                        itemBuilder: (_, i) {
                          final faq = _faqs[i] as Map<String, dynamic>;
                          final question =
                              faq['question']?.toString() ?? '';
                          final answer = faq['answer']?.toString() ?? '';
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: SqCard(
                              child: ExpansionTile(
                                title: Text(
                                  question,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: t.text,
                                  ),
                                ),
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.fromLTRB(
                                        16, 0, 16, 16),
                                    child: Align(
                                      alignment: AlignmentDirectional.centerStart,
                                      child: Text(
                                        answer,
                                        style: TextStyle(
                                          color: t.textSecondary,
                                          height: 1.5,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
