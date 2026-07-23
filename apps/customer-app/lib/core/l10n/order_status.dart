import 'package:flutter_gen/gen_l10n/app_localizations.dart';

String localizedOrderStatus(AppLocalizations l10n, String status) {
  final s = status.toLowerCase();
  if (s.contains('deliver') || s.contains('complet')) return l10n.statusDelivered;
  if (s.contains('arriv')) return l10n.statusDriverArrived;
  if (s.contains('route') || s.contains('progress')) return l10n.statusInTransit;
  if (s.contains('assign') || s.contains('dispatch')) return l10n.statusDriverAssigned;
  if (s.contains('confirm')) return l10n.statusConfirmed;
  if (s.contains('cancel')) return l10n.statusCancelled;
  if (s.contains('pending')) return l10n.statusPending;
  return status.isEmpty ? l10n.statusUpdating : status;
}

String localizedListStatus(AppLocalizations l10n, String status) {
  final s = status.toLowerCase();
  if (s.contains('deliver') || s.contains('complet')) return l10n.statusCompleted;
  if (s.contains('cancel')) return l10n.statusCancelled;
  if (s.contains('route')) return l10n.statusOnRoute;
  if (s.contains('pending')) return l10n.statusPending;
  return status.isEmpty ? '—' : status;
}

String paymentLabel(AppLocalizations l10n, String type) {
  switch (type) {
    case 'cash':
      return l10n.cashOnDelivery;
    case 'card':
      return l10n.cardPay;
    case 'credit':
      return l10n.creditPay;
    case 'apple_pay':
      return l10n.applePay;
    case 'google_pay':
      return l10n.googlePay;
    default:
      return type;
  }
}
