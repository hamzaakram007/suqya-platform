import 'package:flutter/material.dart';

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  bool _isOnline = false;
  bool _jobOfferVisible = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('سقيا - سائق'),
        actions: [
          Switch(
            value: _isOnline,
            onChanged: (v) => setState(() => _isOnline = v),
            activeColor: Colors.green,
          ),
          Text(_isOnline ? 'متاح' : 'غير متاح'),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          Container(
            color: Colors.grey[200],
            child: const Center(child: Icon(Icons.map, size: 80)),
          ),
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _kpi('اليوم', '3', 'رحلات'),
                    _kpi('الأرباح', '450', 'ر.س'),
                    _kpi('التقييم', '4.8', '⭐'),
                  ],
                ),
              ),
            ),
          ),
          if (_jobOfferVisible)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _JobOfferSheet(
                onAccept: () => setState(() => _jobOfferVisible = false),
                onReject: () => setState(() => _jobOfferVisible = false),
              ),
            ),
        ],
      ),
      floatingActionButton: _isOnline
          ? FloatingActionButton(
              onPressed: () => setState(() => _jobOfferVisible = true),
              child: const Icon(Icons.notifications),
            )
          : null,
    );
  }

  Widget _kpi(String label, String value, String unit) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 12)),
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        Text(unit, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}

class _JobOfferSheet extends StatelessWidget {
  final VoidCallback onAccept;
  final VoidCallback onReject;

  const _JobOfferSheet({required this.onAccept, required this.onReject});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('طلب جديد!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('18 طن — الرياض، حي النرجس'),
            const Text('المسافة: 3.2 كم — الأرباح: 45 ر.س'),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(onPressed: onReject, child: const Text('رفض')),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(onPressed: onAccept, child: const Text('قبول')),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
