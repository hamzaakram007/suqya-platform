import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../core/l10n/order_status.dart';
import '../../core/services/customer_api.dart';

/// Map-first home with embedded 3-tap order (address → tank → confirm).
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  List<dynamic> _addresses = [];
  List<dynamic> _tanks = [];
  String? _addressId;
  String? _tankId;
  String _payment = 'cash';
  bool _loading = true;
  bool _submitting = false;
  bool _hasOrderDefaults = false;
  Object? _error;

  static const _paymentOptions = [
    ('cash', Icons.payments_outlined),
    ('card', Icons.credit_card),
    ('credit', Icons.account_balance),
    ('apple_pay', Icons.apple),
    ('google_pay', Icons.account_balance_wallet_outlined),
  ];

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
      final api = ref.read(customerApiProvider);
      final results = await Future.wait([
        api.getAddresses(),
        api.getTankSizes(),
        api.getOrderDefaults(),
      ]);
      final addresses = results[0];
      final tanks = results[1];
      final defaults = results[2] as Map<String, dynamic>;

      String? defaultAddr;
      for (final a in addresses) {
        final m = a as Map<String, dynamic>;
        if (m['isDefault'] == true) {
          defaultAddr = m['id']?.toString();
          break;
        }
      }
      defaultAddr ??= addresses.isNotEmpty
          ? (addresses.first as Map)['id']?.toString()
          : null;

      final defaultsAddr = defaults['addressId']?.toString();
      final defaultsTank = defaults['tankSizeId']?.toString();
      final defaultsPay = defaults['paymentType']?.toString();

      setState(() {
        _addresses = addresses;
        _tanks = tanks;
        _addressId = defaultsAddr ?? defaultAddr;
        _tankId = defaultsTank ??
            (_tankId ??
                (tanks.isNotEmpty
                    ? (tanks.first as Map)['id']?.toString()
                    : null));
        if (defaultsPay != null && defaultsPay.isNotEmpty) {
          _payment = defaultsPay;
        }
        _hasOrderDefaults =
            defaultsAddr != null && defaultsTank != null && defaultsPay != null;
      });
    } catch (e) {
      setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Map<String, dynamic>? get _selectedAddress {
    for (final a in _addresses) {
      final m = a as Map<String, dynamic>;
      if (m['id']?.toString() == _addressId) return m;
    }
    return null;
  }

  Future<void> _confirmOrder() async {
    final l10n = AppLocalizations.of(context)!;
    if (_addressId == null) {
      _showSnack(l10n.selectAddress);
      return;
    }
    if (_tankId == null) {
      _showSnack(l10n.selectTank);
      return;
    }

    String pay = _payment;
    if (!_hasOrderDefaults) {
      final picked = await _pickPayment();
      if (picked == null || !mounted) return;
      pay = picked;
    }

    setState(() => _submitting = true);
    try {
      final order = await ref.read(customerApiProvider).createOrder(
            addressId: _addressId!,
            tankSizeId: _tankId!,
            paymentType: pay,
          );
      final id = order['id']?.toString();
      if (mounted && id != null) {
        await ref.read(customerApiProvider).saveOrderDefaults({
          'addressId': _addressId,
          'tankSizeId': _tankId,
          'paymentType': pay,
        });
        context.push('/tracking/$id');
      }
    } catch (_) {
      if (mounted) _showSnack(l10n.errorCreateOrder);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<String?> _pickPayment() async {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    return showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        var selected = _payment;
        return SqSheetScaffold(
          title: l10n.paymentMethod,
          child: StatefulBuilder(
            builder: (context, setSheet) {
              Widget option(String value, String label, IconData icon) {
                final on = selected == value;
                return Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
                  child: SqCard(
                    selected: on,
                    onTap: () => setSheet(() => selected = value),
                    child: Row(
                      children: [
                        Icon(icon, color: on ? t.primary : t.textSecondary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            label,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: t.text,
                            ),
                          ),
                        ),
                        if (on)
                          Icon(Icons.check_circle, color: t.primary, size: 22),
                      ],
                    ),
                  ),
                );
              }

              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 8),
                  option('cash', l10n.cashOnDelivery, Icons.payments_outlined),
                  option('card', l10n.cardPay, Icons.credit_card),
                  option('credit', l10n.creditPay, Icons.account_balance),
                  option('apple_pay', l10n.applePay, Icons.apple),
                  option('google_pay', l10n.googlePay,
                      Icons.account_balance_wallet_outlined),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
                    child: SqButton(
                      label: l10n.confirmOrder,
                      onPressed: () {
                        _payment = selected;
                        Navigator.pop(ctx, selected);
                      },
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  void _openAddressSheet() {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return SqSheetScaffold(
          title: l10n.selectAddress,
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.sizeOf(context).height * 0.5,
            ),
            child: _addresses.isEmpty
                ? SqEmpty(
                    title: l10n.noAddresses,
                    subtitle: l10n.noAddressesHint,
                    actionLabel: l10n.addAddress,
                    onAction: () {
                      Navigator.pop(ctx);
                      context.push('/addresses');
                    },
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                    shrinkWrap: true,
                    itemCount: _addresses.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final a = _addresses[i] as Map<String, dynamic>;
                      final id = a['id']?.toString();
                      final selected = id == _addressId;
                      return SqCard(
                        selected: selected,
                        onTap: () {
                          setState(() => _addressId = id);
                          Navigator.pop(ctx);
                        },
                        child: Row(
                          children: [
                            Icon(
                              a['isDefault'] == true
                                  ? Icons.home_rounded
                                  : Icons.location_on_outlined,
                              color: selected ? t.primary : t.textSecondary,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    a['label']?.toString() ??
                                        l10n.addressFallback,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: t.text,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${a['street'] ?? ''} ${a['buildingNumber'] ?? ''}',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: t.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final t = sq(context);
    final addr = _selectedAddress;
    final addrLabel = addr == null
        ? l10n.selectAddress
        : (addr['label']?.toString() ??
            '${addr['street'] ?? ''} ${addr['district'] ?? ''}'.trim());

    return Scaffold(
      backgroundColor: t.background,
      body: Stack(
        children: [
          Positioned.fill(
            child: _MapHero(label: l10n.appTitle),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: SqMapChrome(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  child: Row(
                    children: [
                      const SizedBox(width: 8),
                      Icon(Icons.water_drop, color: t.primary, size: 22),
                      const SizedBox(width: 6),
                      Text(
                        l10n.appTitle,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: t.text,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        tooltip: l10n.notifications,
                        onPressed: () => context.push('/notifications'),
                        icon: Icon(Icons.notifications_none_rounded,
                            color: t.text),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: _loading
                ? const _HomeSkeleton()
                : _error != null
                    ? Padding(
                        padding: const EdgeInsets.all(24),
                        child: SqMapChrome(
                          child: SqErrorState(
                            message: l10n.errorLoadData,
                            onRetry: _load,
                          ),
                        ),
                      )
                    : Container(
                        decoration: BoxDecoration(
                          color: t.surface,
                          borderRadius: BorderRadius.vertical(
                            top: Radius.circular(t.radiusXl),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 24,
                              offset: const Offset(0, -4),
                            ),
                          ],
                        ),
                        child: SafeArea(
                          top: false,
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Center(
                                  child: Container(
                                    width: 40,
                                    height: 4,
                                    decoration: BoxDecoration(
                                      color: t.border,
                                      borderRadius: BorderRadius.circular(99),
                                    ),
                                  ),
                                ),
                                if (_hasOrderDefaults) ...[
                                  const SizedBox(height: 12),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: t.primaryMuted,
                                      borderRadius:
                                          BorderRadius.circular(t.radiusMd),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(Icons.bolt_rounded,
                                            color: t.primary, size: 18),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            l10n.smartReorder,
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: t.primary,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 16),
                                Material(
                                  color: t.primaryMuted,
                                  borderRadius:
                                      BorderRadius.circular(t.radiusLg),
                                  child: InkWell(
                                    onTap: _openAddressSheet,
                                    borderRadius:
                                        BorderRadius.circular(t.radiusLg),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 14,
                                        vertical: 12,
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(Icons.place_rounded,
                                              color: t.primary, size: 22),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Text(
                                              addrLabel,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontWeight: FontWeight.w700,
                                                color: t.text,
                                              ),
                                            ),
                                          ),
                                          Icon(Icons.expand_more,
                                              color: t.textSecondary),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  l10n.selectTank,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: t.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                SizedBox(
                                  height: 88,
                                  child: _tanks.isEmpty
                                      ? Center(
                                          child: Text(
                                            l10n.emptyTankSizes,
                                            style: TextStyle(
                                                color: t.textSecondary),
                                          ),
                                        )
                                      : ListView.separated(
                                          scrollDirection: Axis.horizontal,
                                          itemCount: _tanks.length,
                                          separatorBuilder: (_, __) =>
                                              const SizedBox(width: 10),
                                          itemBuilder: (_, i) {
                                            final tank =
                                                _tanks[i] as Map<String, dynamic>;
                                            final id = tank['id']?.toString();
                                            final selected = id == _tankId;
                                            final liters =
                                                tank['capacityLiters']
                                                        ?.toString() ??
                                                    '';
                                            final name = tank['name']
                                                    ?.toString() ??
                                                tank['nameAr']?.toString() ??
                                                '';
                                            return SizedBox(
                                              width: 120,
                                              child: SqChip(
                                                label: name,
                                                subtitle: liters.isEmpty
                                                    ? null
                                                    : l10n.litersUnit(liters),
                                                selected: selected,
                                                onTap: () => setState(
                                                    () => _tankId = id),
                                              ),
                                            );
                                          },
                                        ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  l10n.paymentMethod,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: t.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                SizedBox(
                                  height: 36,
                                  child: ListView.separated(
                                    scrollDirection: Axis.horizontal,
                                    itemCount: _paymentOptions.length,
                                    separatorBuilder: (_, __) =>
                                        const SizedBox(width: 8),
                                    itemBuilder: (_, i) {
                                      final (value, icon) =
                                          _paymentOptions[i];
                                      final selected = _payment == value;
                                      return Material(
                                        color: selected
                                            ? t.primaryMuted
                                            : t.background,
                                        borderRadius:
                                            BorderRadius.circular(99),
                                        child: InkWell(
                                          onTap: () => setState(
                                              () => _payment = value),
                                          borderRadius:
                                              BorderRadius.circular(99),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 6,
                                            ),
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(99),
                                              border: Border.all(
                                                color: selected
                                                    ? t.primary
                                                    : t.border,
                                              ),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  icon,
                                                  size: 14,
                                                  color: selected
                                                      ? t.primary
                                                      : t.textSecondary,
                                                ),
                                                const SizedBox(width: 6),
                                                Text(
                                                  paymentLabel(l10n, value),
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w600,
                                                    color: t.text,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                                const SizedBox(height: 12),
                                SqFab(
                                  label: _submitting
                                      ? l10n.confirming
                                      : l10n.confirmOrder,
                                  onPressed:
                                      _submitting ? () {} : _confirmOrder,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _MapHero extends StatelessWidget {
  const _MapHero({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return Stack(
      fit: StackFit.expand,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                const Color(0xFFD6EAEA),
                t.primaryMuted,
                const Color(0xFFB8D4D4),
                const Color(0xFFE8F2F2),
              ],
            ),
          ),
        ),
        CustomPaint(
            painter: _StreetGridPainter(t.primary.withValues(alpha: 0.08))),
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.location_on, size: 56, color: t.primary),
              const SizedBox(height: 4),
              SqMapChrome(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  child: Text(
                    label,
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
        const Opacity(
          opacity: 0,
          child: MapsStub(height: 1),
        ),
      ],
    );
  }
}

class _StreetGridPainter extends CustomPainter {
  _StreetGridPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 1.2;
    const step = 48.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), p);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), p);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _HomeSkeleton extends StatelessWidget {
  const _HomeSkeleton();

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(t.radiusXl)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SqSkeleton(height: 48, radius: 16),
          const SizedBox(height: 16),
          Row(
            children: const [
              Expanded(child: SqSkeleton(height: 88, radius: 16)),
              SizedBox(width: 10),
              Expanded(child: SqSkeleton(height: 88, radius: 16)),
              SizedBox(width: 10),
              Expanded(child: SqSkeleton(height: 88, radius: 16)),
            ],
          ),
          const SizedBox(height: 16),
          const SqSkeleton(height: 56, radius: 24),
        ],
      ),
    );
  }
}
