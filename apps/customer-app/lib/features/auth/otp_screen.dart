import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final List<TextEditingController> _digits =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _nodes = List.generate(6, (_) => FocusNode());
  bool _loading = false;
  String? _error;

  String get _code => _digits.map((c) => c.text).join();

  Future<void> _verify([String? forced]) async {
    final l10n = AppLocalizations.of(context)!;
    final phone = ref.read(authPhoneProvider);
    if (phone == null || phone.isEmpty) {
      if (mounted) context.go('/login');
      return;
    }
    final code = forced ?? _code;
    if (code.length < 6) {
      setState(() => _error = l10n.errorOtpIncomplete);
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final dio = ref.read(apiClientProvider);
      final response = await dio.post('/auth/otp/verify', data: {
        'phone': phone,
        'code': code,
        'role': 'customer',
      });
      final data = response.data as Map<String, dynamic>;
      await ref.read(authSessionProvider.notifier).setTokens(
            accessToken: data['accessToken'] as String,
            refreshToken: data['refreshToken'] as String?,
          );
      if (mounted) context.go('/home');
    } catch (_) {
      setState(() => _error = l10n.errorOtpInvalid);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onDigit(int i, String v) {
    if (v.length == 1 && i < 5) {
      _nodes[i + 1].requestFocus();
    }
    if (v.isEmpty && i > 0) {
      _nodes[i - 1].requestFocus();
    }
    if (_code.length == 6) {
      _verify();
    }
    setState(() {});
  }

  @override
  void dispose() {
    for (final c in _digits) {
      c.dispose();
    }
    for (final n in _nodes) {
      n.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final phone = ref.watch(authPhoneProvider);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                l10n.otpTitle,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: t.text,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                l10n.otpSubtitle,
                style: TextStyle(fontSize: 15, color: t.textSecondary),
              ),
              if (phone != null) ...[
                const SizedBox(height: 6),
                Directionality(
                  textDirection: TextDirection.ltr,
                  child: Text(
                    phone,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: t.primary,
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 40),
              Directionality(
                textDirection: TextDirection.ltr,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(6, (i) {
                    return SizedBox(
                      width: 48,
                      height: 60,
                      child: TextField(
                        controller: _digits[i],
                        focusNode: _nodes[i],
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: t.text,
                        ),
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(1),
                        ],
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: t.surface,
                          contentPadding: EdgeInsets.zero,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(t.radiusMd),
                            borderSide: BorderSide(color: t.border),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(t.radiusMd),
                            borderSide: BorderSide(color: t.border),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(t.radiusMd),
                            borderSide: BorderSide(color: t.primary, width: 2),
                          ),
                        ),
                        onChanged: (v) => _onDigit(i, v),
                      ),
                    );
                  }),
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(_error!, style: TextStyle(color: t.error)),
              ],
              const Spacer(),
              SqButton(
                label: l10n.confirm,
                onPressed: _loading ? null : _verify,
                loading: _loading,
                height: 56,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
