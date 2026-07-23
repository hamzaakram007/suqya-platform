import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/driver_api.dart';
import '../../core/services/driver_jobs.dart';

const _offerSeconds = 30;

/// Uber-style job offer modal with 30s countdown ring.
Future<void> showJobOfferSheet(
  BuildContext context, {
  required DriverJobOffer offer,
}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    isDismissible: false,
    enableDrag: false,
    backgroundColor: Colors.transparent,
    builder: (ctx) {
      final maxH = MediaQuery.sizeOf(ctx).height * 0.72;
      return ConstrainedBox(
        constraints: BoxConstraints(maxHeight: maxH),
        child: JobOfferSheet(offer: offer),
      );
    },
  );
}

class JobOfferSheet extends ConsumerStatefulWidget {
  const JobOfferSheet({super.key, required this.offer});

  final DriverJobOffer offer;

  @override
  ConsumerState<JobOfferSheet> createState() => _JobOfferSheetState();
}

class _JobOfferSheetState extends ConsumerState<JobOfferSheet>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ring;
  Timer? _tick;
  int _left = _offerSeconds;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _ring = AnimationController(
      vsync: this,
      duration: const Duration(seconds: _offerSeconds),
    )..forward();
    _tick = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _left = (_left - 1).clamp(0, _offerSeconds));
      if (_left <= 0) _autoReject();
    });
  }

  @override
  void dispose() {
    _tick?.cancel();
    _ring.dispose();
    super.dispose();
  }

  Future<void> _autoReject() async {
    if (_busy) return;
    _busy = true;
    _tick?.cancel();
    try {
      await ref.read(driverApiProvider).rejectJob(widget.offer.orderId);
    } catch (_) {}
    ref.read(driverJobsProvider.notifier).removeOffer(widget.offer.orderId);
    if (mounted) Navigator.of(context).pop();
  }

  Future<void> _reject() async {
    if (_busy) return;
    setState(() => _busy = true);
    _tick?.cancel();
    try {
      await ref.read(driverApiProvider).rejectJob(widget.offer.orderId);
    } catch (_) {}
    ref.read(driverJobsProvider.notifier).removeOffer(widget.offer.orderId);
    if (mounted) Navigator.of(context).pop();
  }

  Future<void> _accept() async {
    if (_busy) return;
    setState(() => _busy = true);
    _tick?.cancel();
    try {
      await ref.read(driverApiProvider).acceptJob(widget.offer.orderId);
      ref.read(activeJobIdProvider.notifier).state = widget.offer.orderId;
      ref.read(activeJobOfferProvider.notifier).state = widget.offer;
      ref.read(driverJobsProvider.notifier).removeOffer(widget.offer.orderId);
      if (!mounted) return;
      Navigator.of(context).pop();
      context.push('/jobs/${widget.offer.orderId}');
    } catch (e) {
      if (mounted) {
        setState(() => _busy = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final offer = widget.offer;

    return SqSheetScaffold(
      title: l10n.newJobOffer,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            SizedBox(
              width: 96,
              height: 96,
              child: AnimatedBuilder(
                animation: _ring,
                builder: (_, __) {
                  return Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 96,
                        height: 96,
                        child: CircularProgressIndicator(
                          value: 1 - _ring.value,
                          strokeWidth: 6,
                          backgroundColor: t.border,
                          color: _left <= 5 ? t.error : t.primary,
                        ),
                      ),
                      Text(
                        '$_left',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: t.text,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 20),
            Text(
              l10n.earningsAmount(offer.earnings.toStringAsFixed(0)),
              style: TextStyle(
                fontSize: 40,
                fontWeight: FontWeight.w800,
                color: t.primary,
                height: 1,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              offer.tankName,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: t.text,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              offer.address,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 15, color: t.textSecondary),
            ),
            const SizedBox(height: 8),
            Text(
              l10n.distanceKm(offer.distanceKm.toString()),
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: t.accent,
              ),
            ),
            const SizedBox(height: 28),
            Row(
              children: [
                Expanded(
                  child: SqButton(
                    label: l10n.reject,
                    onPressed: _busy ? null : _reject,
                    variant: SqButtonVariant.ghost,
                    height: 64,
                    loading: _busy,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: SqButton(
                    label: l10n.accept,
                    onPressed: _busy ? null : _accept,
                    height: 64,
                    loading: _busy,
                    icon: Icons.check_rounded,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
