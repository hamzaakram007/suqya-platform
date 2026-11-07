import 'package:flutter/material.dart';

/// Google Maps placeholder — replace with [GoogleMap] when API key is configured.
class MapsStub extends StatelessWidget {
  const MapsStub({
    super.key,
    this.height,
    this.label,
    this.showOpenMapsButton = false,
    this.onOpenMaps,
  });

  final double? height;
  final String? label;
  final bool showOpenMapsButton;
  final VoidCallback? onOpenMaps;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      height: height,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.map_outlined, size: 64, color: Colors.grey.shade500),
              const SizedBox(height: 8),
              Text(
                label ?? 'خريطة Google Maps',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'يتطلب مفتاح API',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: Colors.grey.shade500,
                ),
              ),
            ],
          ),
          if (showOpenMapsButton)
            Positioned(
              bottom: 12,
              child: FilledButton.icon(
                onPressed: onOpenMaps,
                icon: const Icon(Icons.navigation),
                label: const Text('فتح التنقل'),
              ),
            ),
        ],
      ),
    );
  }
}
