import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../config/maps_config.dart';
import '../design/suqya_theme.dart';

/// Lat/lng pin for [SuqyaMap] (works in Google + sandbox modes).
class SuqyaMapMarker {
  const SuqyaMapMarker({
    required this.id,
    required this.latitude,
    required this.longitude,
    this.label,
    this.isDriver = false,
    this.isDestination = false,
  });

  final String id;
  final double latitude;
  final double longitude;
  final String? label;
  final bool isDriver;
  final bool isDestination;
}

/// Map surface that uses Google Maps when `GOOGLE_MAPS_API_KEY` is set,
/// otherwise a sandbox canvas that still renders live markers for tracking UX.
class SuqyaMap extends StatelessWidget {
  const SuqyaMap({
    super.key,
    this.height,
    this.label,
    this.markers = const [],
    this.centerLatitude,
    this.centerLongitude,
    this.zoom = 13,
    this.showOpenMapsButton = false,
    this.onOpenMaps,
    this.onTap,
  });

  final double? height;
  final String? label;
  final List<SuqyaMapMarker> markers;
  final double? centerLatitude;
  final double? centerLongitude;
  final double zoom;
  final bool showOpenMapsButton;
  final VoidCallback? onOpenMaps;
  final void Function(double lat, double lng)? onTap;

  double get _lat =>
      centerLatitude ??
      (markers.isNotEmpty ? markers.first.latitude : MapsConfig.sandboxLat);

  double get _lng =>
      centerLongitude ??
      (markers.isNotEmpty ? markers.first.longitude : MapsConfig.sandboxLng);

  @override
  Widget build(BuildContext context) {
    if (MapsConfig.useGoogleMaps) {
      return _GoogleSuqyaMap(
        height: height,
        markers: markers,
        latitude: _lat,
        longitude: _lng,
        zoom: zoom,
        onTap: onTap,
        showOpenMapsButton: showOpenMapsButton,
        onOpenMaps: onOpenMaps,
      );
    }
    return _SandboxSuqyaMap(
      height: height,
      label: label,
      markers: markers,
      latitude: _lat,
      longitude: _lng,
      showOpenMapsButton: showOpenMapsButton,
      onOpenMaps: onOpenMaps,
      onTap: onTap,
    );
  }
}

/// Back-compat alias — prefer [SuqyaMap].
typedef MapsStub = SuqyaMap;

class _GoogleSuqyaMap extends StatelessWidget {
  const _GoogleSuqyaMap({
    required this.height,
    required this.markers,
    required this.latitude,
    required this.longitude,
    required this.zoom,
    this.onTap,
    this.showOpenMapsButton = false,
    this.onOpenMaps,
  });

  final double? height;
  final List<SuqyaMapMarker> markers;
  final double latitude;
  final double longitude;
  final double zoom;
  final void Function(double lat, double lng)? onTap;
  final bool showOpenMapsButton;
  final VoidCallback? onOpenMaps;

  @override
  Widget build(BuildContext context) {
    final set = <Marker>{
      for (final m in markers)
        Marker(
          markerId: MarkerId(m.id),
          position: LatLng(m.latitude, m.longitude),
          infoWindow: m.label != null
              ? InfoWindow(title: m.label)
              : InfoWindow.noText,
          icon: m.isDriver
              ? BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure)
              : m.isDestination
                  ? BitmapDescriptor.defaultMarkerWithHue(
                      BitmapDescriptor.hueGreen)
                  : BitmapDescriptor.defaultMarker,
        ),
    };

    return SizedBox(
      height: height,
      width: double.infinity,
      child: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: LatLng(latitude, longitude),
              zoom: zoom,
            ),
            markers: set,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            compassEnabled: false,
            onTap: onTap == null
                ? null
                : (p) => onTap!(p.latitude, p.longitude),
          ),
          if (showOpenMapsButton)
            Positioned(
              bottom: 12,
              left: 0,
              right: 0,
              child: Center(
                child: FilledButton.icon(
                  onPressed: onOpenMaps,
                  icon: const Icon(Icons.navigation),
                  label: const Text('فتح التنقل'),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _SandboxSuqyaMap extends StatelessWidget {
  const _SandboxSuqyaMap({
    required this.height,
    required this.markers,
    required this.latitude,
    required this.longitude,
    this.label,
    this.showOpenMapsButton = false,
    this.onOpenMaps,
    this.onTap,
  });

  final double? height;
  final String? label;
  final List<SuqyaMapMarker> markers;
  final double latitude;
  final double longitude;
  final bool showOpenMapsButton;
  final VoidCallback? onOpenMaps;
  final void Function(double lat, double lng)? onTap;

  /// Project WGS84 into a local canvas around the camera center.
  Offset _project(Size size, double lat, double lng) {
    const span = 0.04; // ~4km window
    final dx = ((lng - longitude) / span + 0.5).clamp(0.05, 0.95);
    final dy = ((latitude - lat) / span + 0.5).clamp(0.05, 0.95);
    return Offset(dx * size.width, dy * size.height);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final t = sq(context);

    return Container(
      height: height,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: height == null ? null : BorderRadius.circular(12),
        border: height == null
            ? null
            : Border.all(color: Colors.grey.shade300),
      ),
      clipBehavior: Clip.antiAlias,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final size = Size(
            constraints.maxWidth,
            height ?? constraints.maxHeight,
          );
          return GestureDetector(
            onTapUp: onTap == null
                ? null
                : (d) {
                    // Approximate reverse projection for picker UX.
                    const span = 0.04;
                    final lng = longitude +
                        ((d.localPosition.dx / size.width) - 0.5) * span;
                    final lat = latitude -
                        ((d.localPosition.dy / size.height) - 0.5) * span;
                    onTap!(lat, lng);
                  },
            child: Stack(
              fit: StackFit.expand,
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        t.primary.withValues(alpha: 0.18),
                        const Color(0xFFB8D4D4),
                        t.primaryMuted,
                      ],
                    ),
                  ),
                ),
                CustomPaint(painter: _SandboxGridPainter(t.primary.withValues(alpha: 0.12))),
                ...markers.map((m) {
                  final pos = _project(size, m.latitude, m.longitude);
                  return Positioned(
                    left: pos.dx - 18,
                    top: pos.dy - 18,
                    child: _SandboxPin(
                      isDriver: m.isDriver,
                      isDestination: m.isDestination,
                      label: m.label,
                      color: t.primary,
                    ),
                  );
                }),
                Positioned(
                  top: 12,
                  left: 12,
                  right: 12,
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(99),
                        ),
                        child: Text(
                          MapsConfig.isSandbox
                              ? (label ?? 'خريطة تجريبية · Sandbox map')
                              : (label ?? 'Google Maps'),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: t.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                if (showOpenMapsButton)
                  Positioned(
                    bottom: 12,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: FilledButton.icon(
                        onPressed: onOpenMaps,
                        icon: const Icon(Icons.navigation),
                        label: const Text('فتح التنقل'),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SandboxPin extends StatelessWidget {
  const _SandboxPin({
    required this.color,
    this.isDriver = false,
    this.isDestination = false,
    this.label,
  });

  final Color color;
  final bool isDriver;
  final bool isDestination;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final icon = isDriver
        ? Icons.local_shipping_rounded
        : isDestination
            ? Icons.flag_rounded
            : Icons.place_rounded;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.35),
                blurRadius: 10,
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 18),
        ),
        if (label != null)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              label!,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
            ),
          ),
      ],
    );
  }
}

class _SandboxGridPainter extends CustomPainter {
  _SandboxGridPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 1.2;
    const step = 48.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), p);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), p);
    }
  }

  @override
  bool shouldRepaint(covariant _SandboxGridPainter oldDelegate) =>
      oldDelegate.color != color;
}
