import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../config/api_config.dart';

/// Live driver point from the `/tracking` Socket.io namespace.
class TrackingLocationUpdate {
  TrackingLocationUpdate({
    required this.orderId,
    required this.latitude,
    required this.longitude,
    this.driverId,
    this.recordedAt,
    this.source,
  });

  factory TrackingLocationUpdate.fromJson(Map<String, dynamic> json) {
    return TrackingLocationUpdate(
      orderId: json['orderId']?.toString() ?? '',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      driverId: json['driverId']?.toString(),
      recordedAt: json['recordedAt']?.toString(),
      source: json['source']?.toString(),
    );
  }

  final String orderId;
  final double latitude;
  final double longitude;
  final String? driverId;
  final String? recordedAt;
  final String? source;
}

/// Socket.io client for `namespace=/tracking`.
///
/// Connects to `{API origin}/tracking` (global Nest prefix `/v1` does not apply).
class TrackingSocket {
  TrackingSocket({String? origin}) : _origin = origin ?? ApiConfig.socketOrigin;

  final String _origin;
  io.Socket? _socket;
  final _locations = StreamController<TrackingLocationUpdate>.broadcast();
  final _orderUpdates =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<TrackingLocationUpdate> get locations => _locations.stream;
  Stream<Map<String, dynamic>> get orderUpdates => _orderUpdates.stream;

  bool get isConnected => _socket?.connected == true;

  void connect({required String accessToken}) {
    disconnect();
    final url = '$_origin/tracking';
    if (kDebugMode) debugPrint('[TrackingSocket] connect $url');

    final socket = io.io(
      url,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': accessToken})
          .build(),
    );

    socket.onConnect((_) {
      if (kDebugMode) debugPrint('[TrackingSocket] connected');
    });
    socket.onDisconnect((_) {
      if (kDebugMode) debugPrint('[TrackingSocket] disconnected');
    });
    socket.on('location_update', (data) {
      if (data is Map) {
        _locations.add(
          TrackingLocationUpdate.fromJson(Map<String, dynamic>.from(data)),
        );
      }
    });
    socket.on('order_update', (data) {
      if (data is Map) {
        _orderUpdates.add(Map<String, dynamic>.from(data));
      }
    });

    socket.connect();
    _socket = socket;
  }

  Future<Map<String, dynamic>?> subscribeOrder(String orderId) async {
    final socket = _socket;
    if (socket == null || !socket.connected) return {'error': 'Not connected'};
    final completer = Completer<Map<String, dynamic>?>();
    socket.emitWithAck('subscribe_order', orderId, ack: (dynamic data) {
      if (data is Map) {
        completer.complete(Map<String, dynamic>.from(data));
      } else {
        completer.complete(data == null ? null : {'result': data});
      }
    });
    return completer.future.timeout(
      const Duration(seconds: 5),
      onTimeout: () => {'error': 'subscribe timeout'},
    );
  }

  void emitDriverLocation({
    required String orderId,
    required double latitude,
    required double longitude,
  }) {
    _socket?.emit('driver_location', {
      'orderId': orderId,
      'latitude': latitude,
      'longitude': longitude,
    });
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _locations.close();
    _orderUpdates.close();
  }
}
