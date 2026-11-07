import 'package:flutter/material.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';

import 'package:flutter_core/flutter_core.dart';

import 'package:suqya_driver/l10n/app_localizations.dart';

import '../../core/services/driver_jobs.dart';



class JobsListScreen extends ConsumerWidget {

  const JobsListScreen({super.key});



  @override

  Widget build(BuildContext context, WidgetRef ref) {

    final l10n = AppLocalizations.of(context)!;

    final t = sq(context);

    final jobs = ref.watch(driverJobsProvider);

    final activeJobId = ref.watch(activeJobIdProvider);



    return Scaffold(

      backgroundColor: t.background,

      appBar: AppBar(title: Text(l10n.jobs)),

      body: jobs.isEmpty

          ? SqEmpty(

              title: l10n.noJobsTitle,

              subtitle: l10n.noJobsSubtitle,

              icon: Icons.local_shipping_outlined,

              actionLabel: l10n.backToMap,

              onAction: () => context.go('/home'),

            )

          : ListView.separated(

              padding: const EdgeInsets.all(16),

              itemCount: jobs.length,

              separatorBuilder: (_, __) => const SizedBox(height: 10),

              itemBuilder: (_, i) {

                final job = jobs[i];

                final isActive = activeJobId == job.orderId;

                return SqCard(

                  selected: isActive,

                  onTap: () => context.push('/jobs/${job.orderId}'),

                  child: Row(

                    children: [

                      Icon(Icons.local_shipping_rounded, color: t.primary),

                      const SizedBox(width: 12),

                      Expanded(

                        child: Column(

                          crossAxisAlignment: CrossAxisAlignment.start,

                          children: [

                            Text(

                              job.tankName,

                              style: TextStyle(

                                fontWeight: FontWeight.w700,

                                color: t.text,

                              ),

                            ),

                            Text(

                              '${job.address} · ${l10n.distanceKm(job.distanceKm.toString())}',

                              style: TextStyle(

                                fontSize: 13,

                                color: t.textSecondary,

                              ),

                            ),

                          ],

                        ),

                      ),

                      Text(

                        l10n.earningsAmount(

                          job.earnings.toStringAsFixed(0),

                        ),

                        style: TextStyle(

                          fontWeight: FontWeight.w800,

                          color: t.primary,

                        ),

                      ),

                    ],

                  ),

                );

              },

            ),

    );

  }

}

