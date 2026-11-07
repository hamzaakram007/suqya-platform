import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../providers/locale_provider.dart';
import 'driver_api.dart';
import 'driver_jobs.dart';
import 'offline_queue.dart';

/// Background location tracking stub — reports position periodically when online.
class BackgroundLocationService {
  BackgroundLocationService(this._ref);

  final Ref _ref;
  Timer? _timer;
  bool _running = false;

  static const _defaultLat = 24.7136;
  static const _defaultLng = 46.6753;

  void start() {
    if (_running) return;
    _running = true;
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _report());
    if (kDebugMode) debugPrint('[BackgroundLocation] started');
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _running = false;
    if (kDebugMode) debugPrint('[BackgroundLocation] stopped');
  }

  Future<void> _report() async {
    if (!_ref.read(isOnlineProvider)) return;
    try {
      await _ref.read(driverApiProvider).updateLocation(_defaultLat, _defaultLng);
    } catch (e) {
      final l10n = lookupAppLocalizations(ref.read(localeProvider));
      _ref.read(offlineQueueProvider.notifier).enqueue(
            OfflineAction(
              label: l10n.locationUpdate,
              execute: () => _ref.read(driverApiProvider).updateLocation(_defaultLat, _defaultLng),
            ),
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
