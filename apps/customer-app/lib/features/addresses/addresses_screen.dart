import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:suqya_customer/l10n/app_localizations.dart';
import '../../core/services/customer_api.dart';

class AddressesScreen extends ConsumerStatefulWidget {
  const AddressesScreen({super.key});

  @override
  ConsumerState<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends ConsumerState<AddressesScreen> {
  List<dynamic> _addresses = [];
  bool _loading = true;
  bool _adding = false;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final addresses = await ref.read(customerApiProvider).getAddresses();
      setState(() => _addresses = addresses);
    } catch (e) {
      setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addAddress() async {
    final l10n = AppLocalizations.of(context)!;
    setState(() => _adding = true);
    try {
      await ref.read(customerApiProvider).addAddress({
        'label': l10n.addressFallback,
        'buildingNumber': '12',
        'street': 'Prince St',
        'latitude': 24.7136,
        'longitude': 46.6753,
        'isDefault': _addresses.isEmpty,
      });
      await _load();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.errorAddAddress)),
        );
      }
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(l10n.addresses),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: SqFab(
          label: _adding ? l10n.adding : l10n.addAddress,
          onPressed: _adding ? () {} : _addAddress,
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(t.radiusLg),
              child: SizedBox(
                height: 160,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [t.primaryMuted, const Color(0xFFC5DCDC)],
                        ),
                      ),
                    ),
                    const SuqyaMap(height: 160),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                    itemCount: 3,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, __) =>
                        const SqSkeleton(height: 76, radius: 16),
                  )
                : _error != null
                    ? SqErrorState(
                        message: l10n.errorLoadAddresses,
                        onRetry: _load,
                      )
                    : _addresses.isEmpty
                        ? SqEmpty(
                            title: l10n.noAddresses,
                            subtitle: l10n.noAddressesHint,
                            actionLabel: l10n.addAddress,
                            onAction: _addAddress,
                          )
                        : RefreshIndicator(
                            onRefresh: _load,
                            child: ListView.separated(
                              padding:
                                  const EdgeInsets.fromLTRB(20, 0, 20, 120),
                              itemCount: _addresses.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 10),
                              itemBuilder: (_, i) {
                                final addr =
                                    _addresses[i] as Map<String, dynamic>;
                                final isDefault = addr['isDefault'] == true;
                                return SqCard(
                                  selected: isDefault,
                                  child: Row(
                                    children: [
                                      Icon(
                                        isDefault
                                            ? Icons.home_rounded
                                            : Icons.location_on_outlined,
                                        color: t.primary,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              addr['label']?.toString() ??
                                                  l10n.addressFallback,
                                              style: TextStyle(
                                                fontWeight: FontWeight.w700,
                                                color: t.text,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              '${addr['street'] ?? ''} ${addr['buildingNumber'] ?? ''}',
                                              style: TextStyle(
                                                fontSize: 13,
                                                color: t.textSecondary,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (isDefault)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 10,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: t.primaryMuted,
                                            borderRadius:
                                                BorderRadius.circular(99),
                                          ),
                                          child: Text(
                                            l10n.defaultBadge,
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: t.primary,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
