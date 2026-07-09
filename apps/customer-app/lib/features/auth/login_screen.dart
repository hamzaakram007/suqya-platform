import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController(text: '+9665');

  Future<void> _sendOtp() async {
    final dio = ref.read(apiClientProvider);
    await dio.post('/auth/otp/send', data: {'phone': _phoneController.text});
    if (mounted) context.push('/otp');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Icon(Icons.water_drop, size: 80, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 16),
              Text('سقيا', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 8),
              Text('توصيل المياه بضغطة زر', textAlign: TextAlign.center),
              const Spacer(),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                textDirection: TextDirection.ltr,
                decoration: const InputDecoration(
                  labelText: 'رقم الجوال',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: _sendOtp, child: const Text('إرسال رمز التحقق')),
            ],
          ),
        ),
      ),
    );
  }
}
