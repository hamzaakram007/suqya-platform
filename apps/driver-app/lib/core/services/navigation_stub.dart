import 'package:flutter/material.dart';

/// External navigation stub — integrate with Google Maps / Waze when ready.
class NavigationStub {
  static Future<void> openNavigation({
    required double destinationLat,
    required double destinationLng,
    String? label,
  }) async {
    debugPrint(
      '[NavigationStub] Navigate to $destinationLat,$destinationLng (${label ?? 'destination'})',
    );
  }
}
