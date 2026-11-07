import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/services/driver_api.dart';
import '../../core/services/driver_jobs.dart';
import '../../core/services/background_location.dart';
import '../../core/services/offline_queue.dart';
import '../jobs/job_offer_sheet.dart';

class DriverHomeScreen extends ConsumerStatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  ConsumerState<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends ConsumerState<DriverHomeScreen> {
  Map<String, dynamic>? _earnings;
  bool _loadingEarnings = true;
  bool _offerSheetOpen = false;
  String? _shownOfferId;

  @override
  void initState() {
    super.initState();
    _loadEarnings();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(driverJobsProvider.notifier).seedDemoOffers();
      if (ref.read(isOnlineProvider)) {
        _maybeShowOffer(ref.read(driverJobsProvider), true);
      }
    });
  }

  Future<void> _loadEarnings() async {
    try {
      final data = await ref.read(driverApiProvider).getEarnings();
      if (mounted) setState(() => _earnings = data);
    } catch (_) {
      if (mounted) {
        setState(() => _earnings = {'total': 0, 'today': 0, 'earnings': []});
      }
    } finally {
      if (mounted) setState(() => _loadingEarnings = false);
    }
  }

  Future<void> _toggleOnline(bool value) async {
    final l10n = AppLocalizations.of(context)!;
    ref.read(isOnlineProvider.notifier).state = value;
    final location = ref.read(backgroundLocationProvider);
    try {
      await ref.read(driverApiProvider).setOnlineStatus(value);
      if (value) {
        location.start();
      } else {
        location.stop();
      }
    } catch (_) {
      ref.read(offlineQueueProvider.notifier).enqueue(
            OfflineAction(
              label: value ? l10n.enableOnline : l10n.disableOnline,
              execute: () =>
                  ref.read(driverApiProvider).setOnlineStatus(value),
            ),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.updateFailedQueued)),
        );
      }
    }
  }

  void _maybeShowOffer(List<DriverJobOffer> jobs, bool isOnline) {
    if (!isOnline || jobs.isEmpty || _offerSheetOpen) return;
    final offer = jobs.first;
    if (_shownOfferId == offer.orderId) return;
    _shownOfferId = offer.orderId;
    _offerSheetOpen = true;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      await showJobOfferSheet(context, offer: offer);
      if (mounted) {
        setState(() {
          _offerSheetOpen = false;
          _shownOfferId = null;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final isOnline = ref.watch(isOnlineProvider);
    final queue = ref.watch(offlineQueueProvider);
    final activeJobId = ref.watch(activeJobIdProvider);
    final today = _earnings?['today'] ?? _earnings?['total'] ?? 0;

    ref.listen<List<DriverJobOffer>>(driverJobsProvider, (prev, next) {
      final online = ref.read(isOnlineProvider);
      _maybeShowOffer(next, online);
    });
    ref.listen<bool>(isOnlineProvider, (prev, next) {
      if (next) _maybeShowOffer(ref.read(driverJobsProvider), true);
    });

    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: SuqyaMap(
              label: l10n.driverMapLabel,
              height: null,
              markers: [
                SuqyaMapMarker(
                  id: 'self',
                  latitude: MapsConfig.sandboxLat,
                  longitude: MapsConfig.sandboxLng,
                  isDriver: true,
                  label: l10n.driverMapLabel,
                ),
              ],
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                children: [
                  if (queue.isNotEmpty) ...[
                    _OfflineBanner(
                      count: queue.length,
                      onSync: () =>
                          ref.read(offlineQueueProvider.notifier).flush(),
                    ),
                    const SizedBox(height: 8),
                  ],
                  Row(
                    children: [
                      SqMapChrome(
                        child: InkWell(
                          onTap: () => context.push('/earnings'),
                          borderRadius: BorderRadius.circular(t.radiusLg),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 10,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.payments_rounded,
                                    size: 18, color: t.primary),
                                const SizedBox(width: 8),
                                if (_loadingEarnings)
                                  const SqSkeleton(height: 18, width: 64)
                                else
                                  Text(
                                    l10n.earningsAmount(today.toString()),
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                      color: t.text,
                                    ),
                                  ),
                                const SizedBox(width: 4),
                                Text(
                                  l10n.today,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: t.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const Spacer(),
                      SqMapChrome(
                        child: IconButton(
                          onPressed: () => context.push('/profile'),
                          icon: Icon(Icons.person_rounded, color: t.text),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          Align(
            alignment: Alignment.bottomCenter,
            child: _BottomZone(
              isOnline: isOnline,
              activeJobId: activeJobId,
              onToggle: _toggleOnline,
              onOpenActive: activeJobId != null
                  ? () => context.push('/jobs/$activeJobId')
                  : null,
              onJobs: () => context.push('/jobs'),
            ),
          ),
        ],
      ),
    );
  }
}

class _OfflineBanner extends StatelessWidget {
  const _OfflineBanner({required this.count, required this.onSync});

  final int count;
  final VoidCallback onSync;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    return Material(
      color: t.warning.withValues(alpha: 0.15),
      borderRadius: BorderRadius.circular(t.radiusMd),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            Icon(Icons.cloud_off_rounded, color: t.warning, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                l10n.offlineBannerMessage(count),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: t.text,
                ),
              ),
            ),
            TextButton(
              onPressed: onSync,
              child: Text(l10n.syncNow),
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomZone extends StatelessWidget {
  const _BottomZone({
    required this.isOnline,
    required this.activeJobId,
    required this.onToggle,
    required this.onOpenActive,
    required this.onJobs,
  });

  final bool isOnline;
  final String? activeJobId;
  final ValueChanged<bool> onToggle;
  final VoidCallback? onOpenActive;
  final VoidCallback onJobs;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(t.radiusXl)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 24,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: EdgeInsets.fromLTRB(
        24,
        16,
        24,
        MediaQuery.paddingOf(context).bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: t.border,
              borderRadius: BorderRadius.circular(99),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isOnline ? l10n.youAreOnline : l10n.youAreOffline,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: t.text,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isOnline ? l10n.waitingForJobs : l10n.goOnlineHint,
                      style: TextStyle(fontSize: 14, color: t.textSecondary),
                    ),
                  ],
                ),
              ),
              Switch.adaptive(
                value: isOnline,
                activeColor: t.success,
                onChanged: onToggle,
              ),
            ],
          ),
          const SizedBox(height: 20),
          if (activeJobId != null) ...[
            SqButton(
              label: l10n.continueActiveJob,
              onPressed: onOpenActive,
              height: 64,
              icon: Icons.local_shipping_rounded,
            ),
            const SizedBox(height: 12),
          ],
          SqButton(
            label: isOnline ? l10n.readyForJobs : l10n.goOnlineAction,
            onPressed: () => onToggle(!isOnline),
            height: 64,
            variant: isOnline
                ? SqButtonVariant.secondary
                : SqButtonVariant.primary,
            icon: isOnline ? Icons.radar_rounded : Icons.power_settings_new,
          ),
          const SizedBox(height: 12),
          SqButton(
            label: l10n.jobs,
            onPressed: onJobs,
            height: 52,
            variant: SqButtonVariant.ghost,
            icon: Icons.list_alt_rounded,
          ),
        ],
      ),
    );
  }
}
