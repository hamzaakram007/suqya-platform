import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/l10n/order_status.dart';
import '../../core/services/customer_api.dart';

/// Track tab — shows latest active order or empty state.
class TrackingHubScreen extends ConsumerStatefulWidget {
  const TrackingHubScreen({super.key});

  @override
  ConsumerState<TrackingHubScreen> createState() => _TrackingHubScreenState();
}

class _TrackingHubScreenState extends ConsumerState<TrackingHubScreen> {
  bool _loading = true;
  String? _activeId;
  Object? _error;

  static const _activeStatuses = {
    'pending',
    'confirmed',
    'dispatched',
    'assigned',
    'en_route',
    'arrived',
    'in_progress',
    'PENDING',
    'CONFIRMED',
    'DISPATCHED',
    'ASSIGNED',
    'EN_ROUTE',
    'ARRIVED',
  };

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
      String? active;
      for (final o in orders) {
        final m = o as Map<String, dynamic>;
        final status = m['status']?.toString() ?? '';
        if (_activeStatuses.contains(status) ||
            status.toLowerCase().contains('route') ||
            status.toLowerCase().contains('dispatch')) {
          active = m['id']?.toString();
          break;
        }
      }
      active ??= orders.isNotEmpty
          ? (orders.first as Map)['id']?.toString()
          : null;
      if (mounted && active != null) {
        setState(() {
          _activeId = active;
          _loading = false;
        });
        // Replace hub with live tracking view via push replacement into same branch
        // We render TrackingScreen inline instead.
      } else {
        setState(() {
          _activeId = null;
          _loading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);

    if (_loading) {
      return Scaffold(
        backgroundColor: t.background,
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SqSkeleton(height: 200, radius: 16),
                SizedBox(height: 16),
                SqSkeleton(height: 120, radius: 16),
              ],
            ),
          ),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: SqErrorState(
          message: l10n.errorLoadOrders,
          onRetry: _load,
        ),
      );
    }

    if (_activeId == null) {
      return Scaffold(
        backgroundColor: t.background,
        body: SqEmpty(
          icon: Icons.near_me_disabled_outlined,
          title: l10n.noActiveOrder,
          subtitle: l10n.noActiveOrderHint,
          actionLabel: l10n.orderNow,
          onAction: () => context.go('/home'),
        ),
      );
    }

    return TrackingScreen(orderId: _activeId!, embedded: true);
  }
}

class TrackingScreen extends ConsumerStatefulWidget {
  const TrackingScreen({
    super.key,
    required this.orderId,
    this.embedded = false,
  });

  final String orderId;
  final bool embedded;

  @override
  ConsumerState<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends ConsumerState<TrackingScreen>
    with SingleTickerProviderStateMixin {
  Map<String, dynamic>? _tracking;
  bool _loading = true;
  Object? _error;
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1800),
  )..repeat(reverse: true);

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
      final data =
          await ref.read(customerApiProvider).trackOrder(widget.orderId);
      setState(() => _tracking = data);
    } catch (e) {
      // Fallback: try order detail
      try {
        final order =
            await ref.read(customerApiProvider).getOrder(widget.orderId);
        setState(() => _tracking = order);
      } catch (e2) {
        setState(() => _error = e2);
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  double _progressFor(String status) {
    final s = status.toLowerCase();
    if (s.contains('deliver') || s.contains('complet')) return 1;
    if (s.contains('arriv')) return 0.85;
    if (s.contains('route') || s.contains('progress')) return 0.65;
    if (s.contains('assign') || s.contains('dispatch')) return 0.4;
    if (s.contains('confirm')) return 0.25;
    return 0.15;
  }

  String _statusLabel(String status) {
    return localizedOrderStatus(AppLocalizations.of(context)!, status);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final status = _tracking?['status']?.toString() ?? '';
    final eta = _tracking?['etaMinutes']?.toString() ??
        _tracking?['eta']?.toString() ??
        '—';
    final progress = _progressFor(status);

    return Scaffold(
      backgroundColor: t.background,
      extendBodyBehindAppBar: true,
      appBar: widget.embedded
          ? null
          : AppBar(
              backgroundColor: Colors.transparent,
              title: Text(l10n.trackOrder),
            ),
      body: Stack(
        children: [
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    t.primary.withValues(alpha: 0.22),
                    t.primaryMuted,
                    const Color(0xFFB8D4D4),
                    t.background,
                  ],
                ),
              ),
            ),
          ),
          // Swap-ready MapsStub (hidden until API key wired)
          const Positioned(
            left: 0,
            top: 0,
            child: Opacity(opacity: 0, child: MapsStub(height: 1)),
          ),
          // Pulsing driver marker
          Center(
            child: AnimatedBuilder(
              animation: _pulse,
              builder: (_, __) {
                final scale = 1 + (_pulse.value * 0.12);
                return Transform.scale(
                  scale: scale,
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: t.primary.withValues(alpha: 0.15),
                    ),
                    child: Center(
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: t.primary,
                          boxShadow: [
                            BoxShadow(
                              color: t.primary.withValues(alpha: 0.35),
                              blurRadius: 16,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.local_shipping_rounded,
                          color: Colors.white,
                          size: 22,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: EdgeInsets.fromLTRB(
                16,
                0,
                16,
                widget.embedded ? 8 : 24,
              ),
              child: SqMapChrome(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
                  child: _loading
                      ? const Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SqSkeleton(height: 20),
                            SizedBox(height: 12),
                            SqSkeleton(height: 10),
                            SizedBox(height: 16),
                            SqSkeleton(height: 48, radius: 12),
                          ],
                        )
                      : _error != null
                          ? SqErrorState(
                              message: l10n.errorTrackOrder,
                              onRetry: _load,
                            )
                          : Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        _statusLabel(status),
                                        style: TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.w800,
                                          color: t.text,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: t.primaryMuted,
                                        borderRadius: BorderRadius.circular(99),
                                      ),
                                      child: Text(
                                        '#${widget.orderId.length > 8 ? widget.orderId.substring(0, 8) : widget.orderId}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: t.primary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  l10n.etaMinutes(eta),
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: t.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(99),
                                  child: LinearProgressIndicator(
                                    value: progress,
                                    minHeight: 8,
                                    backgroundColor: t.border,
                                    color: t.primary,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    Expanded(
                                      child: SqButton(
                                        label: l10n.orderDetail,
                                        variant: SqButtonVariant.secondary,
                                        onPressed: () => context
                                            .push('/orders/${widget.orderId}'),
                                        height: 48,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: SqButton(
                                        label: l10n.support,
                                        variant: SqButtonVariant.ghost,
                                        onPressed: () =>
                                            context.push('/support'),
                                        height: 48,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
