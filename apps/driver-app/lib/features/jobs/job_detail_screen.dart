import 'package:flutter/material.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';

import 'package:flutter_core/flutter_core.dart';

import 'package:suqya_driver/l10n/app_localizations.dart';

import '../../core/services/driver_api.dart';

import '../../core/services/driver_jobs.dart';

import '../../core/services/navigation_stub.dart';

import '../../core/services/offline_queue.dart';



enum _JobStep { navigate, filled, arrive, pod }



class JobDetailScreen extends ConsumerStatefulWidget {

  const JobDetailScreen({super.key, required this.orderId});



  final String orderId;



  @override

  ConsumerState<JobDetailScreen> createState() => _JobDetailScreenState();

}



class _JobDetailScreenState extends ConsumerState<JobDetailScreen> {

  Map<String, dynamic>? _order;

  DriverJobOffer? _offer;

  bool _loading = true;

  bool _acting = false;

  _JobStep _step = _JobStep.navigate;



  @override

  void initState() {

    super.initState();

    _load();

  }



  Future<void> _load() async {

    final active = ref.read(activeJobOfferProvider);

    if (active != null && active.orderId == widget.orderId) {

      _offer = active;

    } else {

      final fromList = ref.read(driverJobsProvider).where(

            (j) => j.orderId == widget.orderId,

          );

      _offer = fromList.isEmpty ? null : fromList.first;

    }



    try {

      final order = await ref.read(driverApiProvider).getOrder(widget.orderId);

      if (mounted) setState(() => _order = order);

    } catch (_) {

      if (mounted) setState(() => _order = null);

    } finally {

      if (mounted) setState(() => _loading = false);

    }

  }



  Future<void> _runAction(Future<void> Function() action) async {

    final l10n = AppLocalizations.of(context)!;

    setState(() => _acting = true);

    try {

      await action();

    } catch (e) {

      ref.read(offlineQueueProvider.notifier).enqueue(

            OfflineAction(label: l10n.jobAction, execute: action),

          );

      if (mounted) {

        ScaffoldMessenger.of(context).showSnackBar(

          SnackBar(content: Text(l10n.queuedOffline)),

        );

      }

    } finally {

      if (mounted) setState(() => _acting = false);

    }

  }



  void _advance() {

    setState(() {

      switch (_step) {

        case _JobStep.navigate:

          _step = _JobStep.filled;

        case _JobStep.filled:

          _step = _JobStep.arrive;

        case _JobStep.arrive:

          _step = _JobStep.pod;

        case _JobStep.pod:

          break;

      }

    });

  }



  String _stepLabel(AppLocalizations l10n) {

    switch (_step) {

      case _JobStep.navigate:

        return l10n.stepNavigate;

      case _JobStep.filled:

        return l10n.stepFilled;

      case _JobStep.arrive:

        return l10n.stepArrive;

      case _JobStep.pod:

        return l10n.stepPod;

    }

  }



  @override

  Widget build(BuildContext context) {

    final l10n = AppLocalizations.of(context)!;

    final t = sq(context);

    final offer = _offer;

    final order = _order;

    final address = offer?.address ??

        (order?['address'] is Map

            ? (order!['address']['street']?.toString() ?? '')

            : '');



    return Scaffold(

      body: Stack(

        fit: StackFit.expand,

        children: [

          Positioned.fill(

            child: SuqyaMap(

              label: l10n.jobRouteMap,

              height: null,

              markers: [

                SuqyaMapMarker(

                  id: 'driver',

                  latitude: MapsConfig.sandboxLat,

                  longitude: MapsConfig.sandboxLng,

                  isDriver: true,

                ),

                SuqyaMapMarker(

                  id: 'dest',

                  latitude: MapsConfig.sandboxLat + 0.012,

                  longitude: MapsConfig.sandboxLng + 0.008,

                  isDestination: true,

                ),

              ],

            ),

          ),

          SafeArea(

            child: Padding(

              padding: const EdgeInsets.all(12),

              child: Row(

                children: [

                  SqMapChrome(

                    child: IconButton(

                      onPressed: () => context.pop(),

                      icon: Icon(Icons.arrow_forward_rounded, color: t.text),

                    ),

                  ),

                  const Spacer(),

                  SqMapChrome(

                    child: Padding(

                      padding: const EdgeInsets.symmetric(

                        horizontal: 14,

                        vertical: 10,

                      ),

                      child: Text(

                        '#${widget.orderId}',

                        style: TextStyle(

                          fontWeight: FontWeight.w700,

                          color: t.text,

                        ),

                      ),

                    ),

                  ),

                ],

              ),

            ),

          ),

          Align(

            alignment: Alignment.bottomCenter,

            child: Container(

              width: double.infinity,

              decoration: BoxDecoration(

                color: t.surface,

                borderRadius:

                    BorderRadius.vertical(top: Radius.circular(t.radiusXl)),

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

                MediaQuery.paddingOf(context).bottom + 16,

              ),

              child: _loading

                  ? const Column(

                      mainAxisSize: MainAxisSize.min,

                      children: [

                        SqSkeleton(height: 24, width: 160),

                        SizedBox(height: 16),

                        SqSkeleton(height: 64),

                      ],

                    )

                  : Column(

                      mainAxisSize: MainAxisSize.min,

                      crossAxisAlignment: CrossAxisAlignment.stretch,

                      children: [

                        Container(

                          width: 40,

                          height: 4,

                          alignment: Alignment.center,

                          margin: const EdgeInsets.only(bottom: 16),

                          decoration: BoxDecoration(

                            color: t.border,

                            borderRadius: BorderRadius.circular(99),

                          ),

                        ),

                        Text(

                          offer?.tankName ?? l10n.activeJob,

                          style: TextStyle(

                            fontSize: 22,

                            fontWeight: FontWeight.w800,

                            color: t.text,

                          ),

                        ),

                        if (address.isNotEmpty) ...[

                          const SizedBox(height: 4),

                          Text(

                            address,

                            style: TextStyle(

                              fontSize: 14,

                              color: t.textSecondary,

                            ),

                          ),

                        ],

                        if (offer != null) ...[

                          const SizedBox(height: 8),

                          Text(

                            '${l10n.earningsAmount(offer.earnings.toStringAsFixed(0))} · ${l10n.distanceKm(offer.distanceKm.toString())}',

                            style: TextStyle(

                              fontSize: 15,

                              fontWeight: FontWeight.w700,

                              color: t.primary,

                            ),

                          ),

                        ],

                        const SizedBox(height: 8),

                        Text(

                          _stepLabel(l10n),

                          style: TextStyle(

                            fontSize: 13,

                            color: t.textSecondary,

                          ),

                        ),

                        const SizedBox(height: 20),

                        if (_step == _JobStep.navigate)

                          SqButton(

                            label: l10n.navigate,

                            height: 64,

                            icon: Icons.navigation_rounded,

                            loading: _acting,

                            onPressed: () async {

                              await NavigationStub.openNavigation(

                                destinationLat: 24.7136,

                                destinationLng: 46.6753,

                                label: address,

                              );

                              _advance();

                            },

                          ),

                        if (_step == _JobStep.filled)

                          SqButton(

                            label: l10n.filled,

                            height: 64,

                            icon: Icons.water_drop_rounded,

                            loading: _acting,

                            onPressed: () => _runAction(() async {

                              _advance();

                            }),

                          ),

                        if (_step == _JobStep.arrive)

                          SqButton(

                            label: l10n.arrived,

                            height: 64,

                            icon: Icons.flag_rounded,

                            loading: _acting,

                            onPressed: () => _runAction(() async {

                              _advance();

                            }),

                          ),

                        if (_step == _JobStep.pod)

                          SqButton(

                            label: l10n.pod,

                            height: 64,

                            icon: Icons.verified_rounded,

                            loading: _acting,

                            onPressed: () {

                              context.push('/jobs/${widget.orderId}/pod');

                            },

                          ),

                        const SizedBox(height: 12),

                        Row(

                          children: [

                            Expanded(

                              child: SqButton(

                                label: l10n.navigate,

                                height: 52,

                                variant: SqButtonVariant.ghost,

                                icon: Icons.navigation_outlined,

                                onPressed: () => NavigationStub.openNavigation(

                                  destinationLat: 24.7136,

                                  destinationLng: 46.6753,

                                  label: address,

                                ),

                              ),

                            ),

                            const SizedBox(width: 8),

                            Expanded(

                              child: SqButton(

                                label: l10n.fillStep,

                                height: 52,

                                variant: _step.index >= _JobStep.filled.index

                                    ? SqButtonVariant.secondary

                                    : SqButtonVariant.ghost,

                                onPressed: () => setState(

                                  () => _step = _JobStep.filled,

                                ),

                              ),

                            ),

                            const SizedBox(width: 8),

                            Expanded(

                              child: SqButton(

                                label: l10n.arriveStep,

                                height: 52,

                                variant: _step.index >= _JobStep.arrive.index

                                    ? SqButtonVariant.secondary

                                    : SqButtonVariant.ghost,

                                onPressed: () => setState(

                                  () => _step = _JobStep.arrive,

                                ),

                              ),

                            ),

                            const SizedBox(width: 8),

                            Expanded(

                              child: SqButton(

                                label: l10n.podShort,

                                height: 52,

                                variant: SqButtonVariant.ghost,

                                onPressed: () => context

                                    .push('/jobs/${widget.orderId}/pod'),

                              ),

                            ),

                          ],

                        ),

                      ],

                    ),

            ),

          ),

        ],

      ),

    );

  }

}

