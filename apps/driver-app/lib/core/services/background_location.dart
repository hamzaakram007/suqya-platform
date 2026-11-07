import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:geolocator/geolocator.dart';
import '../providers/locale_provider.dart';
import 'driver_api.dart';
import 'driver_jobs.dart';
import 'offline_queue.dart';

/// Background location — real GPS when permitted, else Riyadh sandbox walk.
///
/// Pushes:
/// 1. `POST /drivers/location` (REST — fans out via TrackingService)
/// 2. Socket `driver_location` when [activeJobIdProvider] is set
class BackgroundLocationService {
  BackgroundLocationService(this._ref);

  final Ref _ref;
  Timer? _timer;
  bool _running = false;
  TrackingSocket? _socket;
  final _rng = Random();

  double _lat = MapsConfig.sandboxLat;
  double _lng = MapsConfig.sandboxLng;

  void start() {
    if (_running) return;
    _running = true;
    _ensureSocket();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _report());
    unawaited(_report());
    if (kDebugMode) {
      debugPrint(
        '[BackgroundLocation] started (maps=${MapsConfig.isSandbox ? 'sandbox' : 'google'})',
      );
    }
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _running = false;
    _socket?.disconnect();
    _socket = null;
    if (kDebugMode) debugPrint('[BackgroundLocation] stopped');
  }

  void _ensureSocket() {
    final token = _ref.read(authSessionProvider.notifier).accessToken;
    if (token == null || token.isEmpty) return;
    _socket ??= TrackingSocket();
    if (!_socket!.isConnected) {
      _socket!.connect(accessToken: token);
    }
  }

  Future<({double lat, double lng})> _resolvePosition() async {
    if (MapsConfig.isSandbox) {
      // Gentle random walk so customer map marker moves in sandbox demos.
      _lat += (_rng.nextDouble() - 0.5) * 0.0015;
      _lng += (_rng.nextDouble() - 0.5) * 0.0015;
      return (lat: _lat, lng: _lng);
    }

    try {
      final permission = await Geolocator.checkPermission();
      var perm = permission;
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied ||
          perm == LocationPermission.deniedForever) {
        return (lat: _lat, lng: _lng);
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 8),
        ),
      );
      _lat = pos.latitude;
      _lng = pos.longitude;
      return (lat: _lat, lng: _lng);
    } catch (e) {
      if (kDebugMode) debugPrint('[BackgroundLocation] GPS fallback: $e');
      return (lat: _lat, lng: _lng);
    }
  }

  Future<void> _report() async {
    if (!_ref.read(isOnlineProvider)) return;
    final pos = await _resolvePosition();
    final orderId = _ref.read(activeJobIdProvider);

    try {
      await _ref.read(driverApiProvider).updateLocation(
            pos.lat,
            pos.lng,
            orderId: orderId,
          );
    } catch (e) {
      final l10n = lookupAppLocalizations(_ref.read(localeProvider));
      _ref.read(offlineQueueProvider.notifier).enqueue(
            OfflineAction(
              label: l10n.locationUpdate,
              execute: () => _ref.read(driverApiProvider).updateLocation(
                    pos.lat,
                    pos.lng,
                    orderId: orderId,
                  ),
            ),
          );
    }

    if (orderId != null && orderId.isNotEmpty && !orderId.startsWith('demo-')) {
      _ensureSocket();
      _socket?.emitDriverLocation(
        orderId: orderId,
        latitude: pos.lat,
        longitude: pos.lng,
      );
    }
  }

  bool get isRunning => _running;
}

final backgroundLocationProvider = Provider<BackgroundLocationService>((ref) {
  final service = BackgroundLocationService(ref);
  ref.onDispose(service.stop);
  return service;
});
