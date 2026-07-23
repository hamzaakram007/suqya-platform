import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _sendOtp() async {
    final l10n = AppLocalizations.of(context)!;
    final local = _phoneController.text.trim().replaceAll(RegExp(r'\s'), '');
    if (local.length < 9) {
      setState(() => _error = l10n.errorInvalidPhone);
      return;
    }
    final phone = local.startsWith('+')
        ? local
        : local.startsWith('966')
            ? '+$local'
            : '+966$local';
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final dio = ref.read(apiClientProvider);
      await dio.post('/auth/otp/send', data: {'phone': phone});
      ref.read(authPhoneProvider.notifier).state = phone;
      if (mounted) context.push('/otp');
    } catch (e) {
      if (mounted) {
        setState(() => _error = l10n.errorOtpSendFailed);
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [t.primaryMuted, t.background],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(flex: 2),
                Icon(Icons.water_drop_rounded, size: 56, color: t.primary),
                const SizedBox(height: 16),
                Text(
                  l10n.appTitle,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w800,
                    color: t.text,
                    height: 1,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  l10n.appTagline,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: t.textSecondary),
                ),
                const Spacer(flex: 2),
                Text(
                  l10n.phoneLabel,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: t.textSecondary,
                  ),
                ),
                const SizedBox(height: 10),
                Directionality(
                  textDirection: TextDirection.ltr,
                  child: Container(
                    decoration: BoxDecoration(
                      color: t.surface,
                      borderRadius: BorderRadius.circular(t.radiusXl),
                      border: Border.all(color: t.border),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        Text(
                          '+966',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: t.text,
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 28,
                          margin: const EdgeInsets.symmetric(horizontal: 14),
                          color: t.border,
                        ),
                        Expanded(
                          child: TextField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(9),
                            ],
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 1.5,
                              color: t.text,
                            ),
                            decoration: InputDecoration(
                              hintText: l10n.phoneHint,
                              hintStyle: TextStyle(
                                color: t.textSecondary.withValues(alpha: 0.45),
                                fontWeight: FontWeight.w500,
                                letterSpacing: 1,
                              ),
                              border: InputBorder.none,
                              contentPadding:
                                  const EdgeInsets.symmetric(vertical: 20),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    style: TextStyle(color: t.error, fontSize: 14),
                  ),
                ],
                const SizedBox(height: 24),
                SqButton(
                  label: l10n.sendOtp,
                  onPressed: _loading ? null : _sendOtp,
                  loading: _loading,
                  height: 56,
                ),
                const SizedBox(height: 12),
                Text(
                  l10n.otpHint,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: t.textSecondary),
                ),
                const Spacer(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
