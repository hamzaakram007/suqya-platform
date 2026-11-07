import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class DriverOtpScreen extends ConsumerStatefulWidget {
  const DriverOtpScreen({super.key});

  @override
  ConsumerState<DriverOtpScreen> createState() => _DriverOtpScreenState();
}

class _DriverOtpScreenState extends ConsumerState<DriverOtpScreen> {
  final _codeController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _verify() async {
    final phone = ref.read(authPhoneProvider);
    if (phone == null) {
      if (mounted) context.go('/login');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response =
          await ref.read(apiClientProvider).post('/auth/otp/verify', data: {
        'phone': phone,
        'code': _codeController.text,
        'role': 'driver',
      });
      final data = response.data as Map<String, dynamic>;
      await ref.read(authSessionProvider.notifier).setTokens(
            accessToken: data['accessToken'] as String,
            refreshToken: data['refreshToken'] as String?,
          );
      if (mounted) context.go('/home');
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final phone = ref.watch(authPhoneProvider);
    final t = sq(context);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: Text(l10n.otpTitle)),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (phone != null)
              Text(
                l10n.otpSentTo(phone),
                textAlign: TextAlign.center,
                textDirection: TextDirection.ltr,
                style: TextStyle(color: t.textSecondary),
              ),
            const SizedBox(height: 24),
            if (_error != null) ...[
              Text(_error!,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: t.error)),
              const SizedBox(height: 12),
            ],
            TextField(
              controller: _codeController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 28,
                letterSpacing: 10,
                fontWeight: FontWeight.w700,
              ),
              decoration: InputDecoration(
                labelText: l10n.enterCode,
                counterText: '',
                filled: true,
                fillColor: t.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(t.radiusLg),
                ),
              ),
            ),
            const SizedBox(height: 24),
            SqButton(
              label: l10n.confirm,
              height: 64,
              loading: _loading,
              onPressed: _loading ? null : _verify,
            ),
          ],
        ),
      ),
    );
  }
}
