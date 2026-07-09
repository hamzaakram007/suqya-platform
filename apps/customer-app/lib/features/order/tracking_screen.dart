import 'package:flutter/material.dart';

class TrackingScreen extends StatelessWidget {
  final String orderId;
  const TrackingScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تتبع الطلب')),
      body: Column(
        children: [
          Expanded(
            child: Container(
              color: Colors.grey[200],
              child: const Center(child: Icon(Icons.map, size: 80)),
            ),
          ),
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('طلب #$orderId', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const LinearProgressIndicator(),
                  const SizedBox(height: 8),
                  const Text('السائق في الطريق — الوصول خلال 25 دقيقة'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
