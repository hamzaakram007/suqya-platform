import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/driver_api.dart';
import '../../core/services/driver_jobs.dart';
import '../../core/services/offline_queue.dart';

class PodScreen extends ConsumerStatefulWidget {
  const PodScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<PodScreen> createState() => _PodScreenState();
}

class _PodScreenState extends ConsumerState<PodScreen> {
  final _otpController = TextEditingController();
  bool _photoTaken = false;
  bool _signatureCaptured = false;
  bool _loading = false;

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    if (!_photoTaken && !_signatureCaptured) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.podRequired)),
      );
      return;
    }
    setState(() => _loading = true);
    Future<void> exec() => ref.read(driverApiProvider).submitPod(
          widget.orderId,
          photoUrl: _photoTaken ? 'stub://photo/${widget.orderId}' : null,
          signatureUrl:
              _signatureCaptured ? 'stub://signature/${widget.orderId}' : null,
          otp: _otpController.text.isEmpty ? null : _otpController.text,
        );
    try {
      await exec();
      ref.read(activeJobIdProvider.notifier).state = null;
      ref.read(activeJobOfferProvider.notifier).state = null;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.podSuccess)),
        );
        context.go('/home');
      }
    } catch (e) {
      ref.read(offlineQueueProvider.notifier).enqueue(
            OfflineAction(label: l10n.podOfflineLabel, execute: exec),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.queuedOffline)),
        );
        context.go('/home');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: Text(l10n.pod),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                l10n.documentDelivery,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: t.text,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                l10n.podInstructions,
                style: TextStyle(fontSize: 15, color: t.textSecondary),
              ),
              const SizedBox(height: 28),
              Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: _PodCta(
                        done: _photoTaken,
                        icon: Icons.photo_camera_rounded,
                        label: l10n.photo,
                        subtitle: l10n.capture,
                        doneLabel: l10n.done,
                        onTap: () => setState(() => _photoTaken = true),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _PodCta(
                        done: _signatureCaptured,
                        icon: Icons.draw_rounded,
                        label: l10n.signature,
                        subtitle: l10n.customer,
                        doneLabel: l10n.done,
                        onTap: () =>
                            setState(() => _signatureCaptured = true),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  labelText: l10n.customerOtpOptional,
                  filled: true,
                  fillColor: t.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(t.radiusLg),
                    borderSide: BorderSide(color: t.border),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SqButton(
                label: l10n.submitPod,
                height: 64,
                loading: _loading,
                icon: Icons.check_circle_rounded,
                onPressed: _loading ? null : _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PodCta extends StatelessWidget {
  const _PodCta({
    required this.done,
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.doneLabel,
    required this.onTap,
  });

  final bool done;
  final IconData icon;
  final String label;
  final String subtitle;
  final String doneLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return Material(
      color: done ? t.primaryMuted : t.surface,
      borderRadius: BorderRadius.circular(t.radiusXl),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(t.radiusXl),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(t.radiusXl),
            border: Border.all(
              color: done ? t.primary : t.border,
              width: done ? 2 : 1,
            ),
          ),
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                done ? Icons.check_circle_rounded : icon,
                size: 64,
                color: done ? t.success : t.primary,
              ),
              const SizedBox(height: 16),
              Text(
                label,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: t.text,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                done ? doneLabel : subtitle,
                style: TextStyle(fontSize: 14, color: t.textSecondary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
