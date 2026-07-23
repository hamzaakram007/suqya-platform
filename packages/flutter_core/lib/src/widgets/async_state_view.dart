import 'package:flutter/material.dart';

class AsyncStateView<T> extends StatelessWidget {
  const AsyncStateView({
    super.key,
    required this.isLoading,
    required this.error,
    required this.data,
    required this.builder,
    this.onRetry,
    this.emptyMessage = 'لا توجد بيانات',
  });

  final bool isLoading;
  final Object? error;
  final T? data;
  final Widget Function(BuildContext context, T data) builder;
  final VoidCallback? onRetry;
  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
              const SizedBox(height: 12),
              Text('حدث خطأ', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              if (onRetry != null) ...[
                const SizedBox(height: 16),
                OutlinedButton(onPressed: onRetry, child: const Text('إعادة المحاولة')),
              ],
            ],
          ),
        ),
      );
    }
    if (data == null || (data is List && (data as List).isEmpty)) {
      return Center(child: Text(emptyMessage));
    }
    return builder(context, data as T);
  }
}
