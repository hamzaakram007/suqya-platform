import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class SupportScreen extends ConsumerStatefulWidget {
  const SupportScreen({super.key});

  @override
  ConsumerState<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends ConsumerState<SupportScreen> {
  List<dynamic> _tickets = [];
  bool _loading = true;
  bool _creating = false;
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
      final tickets = await ref.read(customerApiProvider).getSupportTickets();
      setState(() => _tickets = tickets);
    } catch (e) {
      setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _createTicket() async {
    final l10n = AppLocalizations.of(context)!;
    setState(() => _creating = true);
    try {
      await ref.read(customerApiProvider).createTicket(
            l10n.defaultTicketSubject,
            l10n.defaultTicketMessage,
          );
      await _load();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.errorCreateTicket)),
        );
      }
    } finally {
      if (mounted) setState(() => _creating = false);
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
        title: Text(l10n.support),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: SqFab(
        label: _creating ? l10n.sending : l10n.newTicket,
        onPressed: _creating ? () {} : _createTicket,
      ),
      body: _loading
          ? ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
              itemCount: 3,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, __) => const SqSkeleton(height: 72, radius: 16),
            )
          : _error != null
              ? SqErrorState(message: l10n.errorLoadTickets, onRetry: _load)
              : _tickets.isEmpty
                  ? SqEmpty(
                      icon: Icons.support_agent_outlined,
                      title: l10n.noTickets,
                      subtitle: l10n.noTicketsHint,
                      actionLabel: l10n.newTicket,
                      onAction: _createTicket,
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
                        itemCount: _tickets.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          final ticket = _tickets[i] as Map<String, dynamic>;
                          return SqCard(
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: t.primaryMuted,
                                    borderRadius:
                                        BorderRadius.circular(t.radiusMd),
                                  ),
                                  child: Icon(Icons.chat_bubble_outline,
                                      color: t.primary),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        ticket['subject']?.toString() ??
                                            l10n.ticketFallback,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          color: t.text,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        ticket['status']?.toString() ?? '',
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: t.textSecondary,
                                        ),
                                      ),
                                    ],
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
