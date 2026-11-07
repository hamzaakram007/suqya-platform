import 'dart:async';

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
    'accepted',
    'filling',
    'in_transit',
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
            status.toLowerCase().contains('dispatch') ||
            status.toLowerCase().contains('transit') ||
            status.toLowerCase().contains('filling')) {
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
  double? _driverLat;
  double? _driverLng;
  double? _destLat;
  double? _destLng;
  TrackingSocket? _socket;
  StreamSubscription<TrackingLocationUpdate>? _locSub;
  Timer? _poll;

  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1800),
  )..repeat(reverse: true);

  @override
  void initState() {
    super.initState();
    _load();
    _connectLive();
    _poll = Timer.periodic(const Duration(seconds: 15), (_) => _loadQuiet());
  }

  Future<void> _connectLive() async {
    final token = ref.read(authSessionProvider.notifier).accessToken;
    if (token == null || token.isEmpty) return;

    final socket = TrackingSocket();
    socket.connect(accessToken: token);
    _socket = socket;
    _locSub = socket.locations.listen((u) {
      if (u.orderId != widget.orderId) return;
      if (!mounted) return;
      setState(() {
        _driverLat = u.latitude;
        _driverLng = u.longitude;
      });
    });

    // Wait briefly for connect, then subscribe.
    await Future<void>.delayed(const Duration(milliseconds: 400));
    await socket.subscribeOrder(widget.orderId);
  }

  Future<void> _loadQuiet() async {
    try {
      final data =
          await ref.read(customerApiProvider).trackOrder(widget.orderId);
      if (!mounted) return;
      _applyTracking(data);
    } catch (_) {}
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data =
          await ref.read(customerApiProvider).trackOrder(widget.orderId);
      _applyTracking(data);
    } catch (e) {
      try {
        final order =
            await ref.read(customerApiProvider).getOrder(widget.orderId);
        _applyTracking(order);
      } catch (e2) {
        setState(() => _error = e2);
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _applyTracking(Map<String, dynamic> data) {
    final driver = data['driver'];
    double? dLat;
    double? dLng;
    if (driver is Map) {
      dLat = (driver['latitude'] as num?)?.toDouble();
      dLng = (driver['longitude'] as num?)?.toDouble();
    }
    final points = data['trackingPoints'];
    if ((dLat == null || dLng == null) && points is List && points.isNotEmpty) {
      final latest = points.first;
      if (latest is Map) {
        dLat ??= (latest['latitude'] as num?)?.toDouble();
        dLng ??= (latest['longitude'] as num?)?.toDouble();
      }
    }

    final address = data['address'];
    double? aLat;
    double? aLng;
    if (address is Map) {
      aLat = (address['latitude'] as num?)?.toDouble();
      aLng = (address['longitude'] as num?)?.toDouble();
    }

    setState(() {
      _tracking = data;
      if (dLat != null && dLng != null) {
        _driverLat = dLat;
        _driverLng = dLng;
      }
      if (aLat != null && aLng != null) {
        _destLat = aLat;
        _destLng = aLng;
      }
    });
  }

  @override
  void dispose() {
    _pulse.dispose();
    _poll?.cancel();
    _locSub?.cancel();
    _socket?.dispose();
    super.dispose();
  }

  double _progressFor(String status) {
    final s = status.toLowerCase();
    if (s.contains('deliver') || s.contains('complet')) return 1;
    if (s.contains('arriv')) return 0.85;
    if (s.contains('transit') || s.contains('route') || s.contains('progress')) {
      return 0.65;
    }
    if (s.contains('filling')) return 0.5;
    if (s.contains('accept') || s.contains('assign') || s.contains('dispatch')) {
      return 0.4;
    }
    if (s.contains('confirm')) return 0.25;
    return 0.15;
  }

  String _statusLabel(String status) {
    return localizedOrderStatus(AppLocalizations.of(context)!, status);
  }

  List<SuqyaMapMarker> get _markers {
    final list = <SuqyaMapMarker>[];
    final lat = _driverLat ?? MapsConfig.sandboxLat;
    final lng = _driverLng ?? MapsConfig.sandboxLng;
    list.add(
      SuqyaMapMarker(
        id: 'driver',
        latitude: lat,
        longitude: lng,
        isDriver: true,
      ),
    );
    if (_destLat != null && _destLng != null) {
      list.add(
        SuqyaMapMarker(
          id: 'dest',
          latitude: _destLat!,
          longitude: _destLng!,
          isDestination: true,
        ),
      );
    }
    return list;
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
    final mapCenterLat = _driverLat ?? _destLat ?? MapsConfig.sandboxLat;
    final mapCenterLng = _driverLng ?? _destLng ?? MapsConfig.sandboxLng;

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
            child: SuqyaMap(
              height: null,
              centerLatitude: mapCenterLat,
              centerLongitude: mapCenterLng,
              markers: _markers,
              label: MapsConfig.isSandbox
                  ? 'تتبع تجريبي · Live sandbox track'
                  : null,
            ),
          ),
          // Pulsing halo over driver region (works on sandbox + google chrome)
          IgnorePointer(
            child: Center(
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
                        color: t.primary.withValues(alpha: 0.12),
                      ),
                    ),
                  );
                },
              ),
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
                                if (_driverLat != null) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    '${_driverLat!.toStringAsFixed(4)}, ${_driverLng!.toStringAsFixed(4)}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: t.textSecondary,
                                    ),
                                  ),
                                ],
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
