import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// V1 multi-step flow retired — order lives on Home sheet.
class OrderFlowScreen extends StatelessWidget {
  const OrderFlowScreen({super.key});

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) context.go('/home');
    });
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
