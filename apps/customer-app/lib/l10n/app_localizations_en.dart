// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Suqya';

  @override
  String get appTagline => 'Clean water… to your door';

  @override
  String get phoneLabel => 'Phone number';

  @override
  String get phoneHint => '5XXXXXXXX';

  @override
  String get sendOtp => 'Continue';

  @override
  String get otpTitle => 'Verification code';

  @override
  String get otpSubtitle => 'Enter the code sent to your phone';

  @override
  String get otpHint => 'We will send a one-time verification code';

  @override
  String get enterCode => 'Code';

  @override
  String get confirm => 'Confirm';

  @override
  String get confirmOrder => 'Confirm order';

  @override
  String get smartReorder => 'Quick reorder — your saved choices are ready';

  @override
  String get welcome => 'Welcome';

  @override
  String get orderNow => 'Order now';

  @override
  String get homeTab => 'Home';

  @override
  String get trackTab => 'Track';

  @override
  String get accountTab => 'Account';

  @override
  String get orders => 'My orders';

  @override
  String get orderDetail => 'Order details';

  @override
  String get addresses => 'Addresses';

  @override
  String get wallet => 'Wallet';

  @override
  String get support => 'Support';

  @override
  String get notifications => 'Notifications';

  @override
  String get settings => 'Settings';

  @override
  String get coupons => 'Coupons';

  @override
  String get credit => 'Credit account';

  @override
  String get invoices => 'Invoices';

  @override
  String get ratings => 'Ratings';

  @override
  String get recurringOrders => 'Recurring orders';

  @override
  String get favorites => 'Favorites';

  @override
  String get help => 'Help';

  @override
  String get faq => 'FAQ';

  @override
  String get about => 'About Suqya';

  @override
  String get profile => 'Account';

  @override
  String get trackOrder => 'Track order';

  @override
  String get noActiveOrder => 'No active order';

  @override
  String get noActiveOrderHint =>
      'Place an order from Home to start live tracking';

  @override
  String get selectAddress => 'Choose address';

  @override
  String get selectTank => 'Choose size';

  @override
  String get paymentMethod => 'Payment method';

  @override
  String get cashOnDelivery => 'Cash on delivery';

  @override
  String get cardPay => 'Card / Mada';

  @override
  String get creditPay => 'Credit account';

  @override
  String get applePay => 'Apple Pay';

  @override
  String get googlePay => 'Google Pay';

  @override
  String get balance => 'Balance';

  @override
  String get topUp => 'Top up wallet';

  @override
  String get addAddress => 'Add address';

  @override
  String get newTicket => 'New ticket';

  @override
  String get language => 'Language';

  @override
  String get languageAr => 'العربية';

  @override
  String get languageEn => 'English';

  @override
  String get switchLanguage => 'Change language';

  @override
  String get logout => 'Sign out';

  @override
  String get noData => 'Nothing here yet';

  @override
  String get noOrders => 'No orders yet';

  @override
  String get noOrdersHint => 'Your first order is three taps away';

  @override
  String get noAddresses => 'No saved addresses';

  @override
  String get noAddressesHint => 'Add a delivery address for faster ordering';

  @override
  String get noTickets => 'No support tickets';

  @override
  String get noTicketsHint => 'We’re here whenever you need us';

  @override
  String get emptyNotifications => 'No notifications';

  @override
  String get emptyFaqs => 'No questions yet';

  @override
  String get emptyTankSizes => 'No tank sizes available';

  @override
  String get emptyWalletActivity => 'Top-ups and payments will appear here';

  @override
  String get emptyFavorites => 'No favorites yet';

  @override
  String get retry => 'Retry';

  @override
  String get loading => 'Loading…';

  @override
  String get confirming => 'Confirming…';

  @override
  String get adding => 'Adding…';

  @override
  String get sending => 'Sending…';

  @override
  String get errorGeneric => 'Something went wrong, please try again';

  @override
  String get errorNetwork => 'Check your connection and try again';

  @override
  String get errorLoadData => 'Could not load data';

  @override
  String get errorLoadOrders => 'Could not load orders';

  @override
  String get errorLoadAddresses => 'Could not load addresses';

  @override
  String get errorLoadWallet => 'Could not load wallet';

  @override
  String get errorLoadTickets => 'Could not load tickets';

  @override
  String get errorLoadFaqs => 'Could not load FAQs';

  @override
  String get errorLoad => 'Could not load';

  @override
  String get errorCreateOrder => 'Could not create order';

  @override
  String get errorAddAddress => 'Could not add address';

  @override
  String get errorCreateTicket => 'Could not create ticket';

  @override
  String get errorTrackOrder => 'Could not track order';

  @override
  String get errorTopUp => 'Top-up failed';

  @override
  String get errorInvalidPhone => 'Enter a valid Saudi mobile number';

  @override
  String get errorOtpSendFailed => 'Could not send code. Try again.';

  @override
  String get errorOtpIncomplete => 'Enter the full code';

  @override
  String get errorOtpInvalid => 'Invalid code. Try again.';

  @override
  String get defaultCustomerName => 'Suqya customer';

  @override
  String get yourServices => 'Your services';

  @override
  String get helpAndSettings => 'Help & settings';

  @override
  String get pushNotifications => 'Push notifications';

  @override
  String get pushNotificationsHint => 'Receive order updates';

  @override
  String get appearance => 'Appearance';

  @override
  String get themeSystem => 'System';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';

  @override
  String get biometricUnlock => 'Unlock with biometrics / Face ID';

  @override
  String get biometricUnlockHint =>
      'Quick protection when returning to the app';

  @override
  String get addressFallback => 'Address';

  @override
  String get defaultBadge => 'Default';

  @override
  String litersUnit(String liters) {
    return '$liters L';
  }

  @override
  String get statusDelivered => 'Delivered';

  @override
  String get statusDriverArrived => 'Driver arrived';

  @override
  String get statusInTransit => 'On the way to you';

  @override
  String get statusDriverAssigned => 'Driver assigned';

  @override
  String get statusConfirmed => 'Order confirmed';

  @override
  String get statusPending => 'Pending';

  @override
  String get statusUpdating => 'Updating…';

  @override
  String get statusCompleted => 'Completed';

  @override
  String get statusCancelled => 'Cancelled';

  @override
  String get statusOnRoute => 'On the way';

  @override
  String get waterOrder => 'Water order';

  @override
  String orderNumber(String id) {
    return 'Order #$id';
  }

  @override
  String get labelStatus => 'Status';

  @override
  String get labelSize => 'Size';

  @override
  String get labelPayment => 'Payment';

  @override
  String get labelTotal => 'Total';

  @override
  String get deliveryAddress => 'Delivery address';

  @override
  String get zatcaInvoice => 'ZATCA invoice / QR';

  @override
  String get scanQrHint => 'Scan the code to verify the invoice';

  @override
  String topUpSuccess(String amount) {
    return 'Added $amount SAR to your wallet';
  }

  @override
  String get recentActivity => 'Recent activity';

  @override
  String get transactionFallback => 'Transaction';

  @override
  String get ticketFallback => 'Ticket';

  @override
  String get defaultTicketSubject => 'Order inquiry';

  @override
  String get defaultTicketMessage => 'I need help with my latest order';

  @override
  String get version => 'Version 0.1.0';

  @override
  String get aboutDescription =>
      'Suqya — water tanker delivery across Saudi Arabia. Fast, reliable water delivery to your door.';

  @override
  String get copyright => '© 2026 Suqya. All rights reserved.';

  @override
  String get couponCodeLabel => 'Coupon code';

  @override
  String get validateCoupon => 'Validate coupon';

  @override
  String couponValid(String code) {
    return 'Valid coupon: $code';
  }

  @override
  String discountAmount(String amount) {
    return 'Discount: $amount SAR';
  }

  @override
  String get creditLimit => 'Limit';

  @override
  String get creditUsed => 'Used';

  @override
  String get creditAvailable => 'Available';

  @override
  String invoiceNumber(String number) {
    return 'Invoice #$number';
  }

  @override
  String get thanksForRating => 'Thanks for your rating';

  @override
  String get orderIdLabel => 'Order ID';

  @override
  String get ratingLabel => 'Rating';

  @override
  String get commentOptional => 'Comment (optional)';

  @override
  String get submitRating => 'Submit rating';

  @override
  String get activeSubscription => 'Active subscription';

  @override
  String planLabel(String name) {
    return 'Plan: $name';
  }

  @override
  String frequencyLabel(String frequency) {
    return 'Frequency: $frequency';
  }

  @override
  String get frequencyWeekly => 'Weekly';

  @override
  String get perMonth => 'month';

  @override
  String etaMinutes(String minutes) {
    return 'Arriving in $minutes min';
  }

  @override
  String sar(String amount) {
    return '$amount SAR';
  }
}
