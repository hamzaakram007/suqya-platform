import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../providers/locale_provider.dart';

/// In-memory job offers queue — populated via push notifications / polling stub.
class DriverJobOffer {
  DriverJobOffer({
    required this.orderId,
    required this.tankName,
    required this.address,
    required this.distanceKm,
    required this.earnings,
  });

  final String orderId;
  final String tankName;
  final String address;
  final double distanceKm;
  final double earnings;
}

class DriverJobsNotifier extends StateNotifier<List<DriverJobOffer>> {
  DriverJobsNotifier(this._ref) : super([]);

  final Ref _ref;

  void addOffer(DriverJobOffer offer) {
    if (state.any((j) => j.orderId == offer.orderId)) return;
    state = [...state, offer];
  }

  void removeOffer(String orderId) {
    state = state.where((j) => j.orderId != orderId).toList();
  }

  void seedDemoOffers() {
    if (state.isNotEmpty) return;
    final l10n = lookupAppLocalizations(_ref.read(localeProvider));
    state = [
      DriverJobOffer(
        orderId: 'demo-order-1',
        tankName: l10n.demoTank18,
        address: l10n.demoAddress1,
        distanceKm: 3.2,
        earnings: 45,
      ),
      DriverJobOffer(
        orderId: 'demo-order-2',
        tankName: l10n.demoTank12,
        address: l10n.demoAddress2,
        distanceKm: 5.1,
        earnings: 38,
      ),
    ];
  }
}

final driverJobsProvider =
    StateNotifierProvider<DriverJobsNotifier, List<DriverJobOffer>>(
  (ref) => DriverJobsNotifier(ref),
);

final activeJobIdProvider = StateProvider<String?>((ref) => null);

final activeJobOfferProvider = StateProvider<DriverJobOffer?>((ref) => null);

final isOnlineProvider = StateProvider<bool>((ref) => false);
