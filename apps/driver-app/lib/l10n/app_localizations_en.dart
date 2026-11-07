// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Suqya - Driver';

  @override
  String get phoneLabel => 'Phone number';

  @override
  String get sendOtp => 'Send verification code';

  @override
  String get otpTitle => 'Verification code';

  @override
  String get enterCode => 'Enter code';

  @override
  String get confirm => 'Confirm';

  @override
  String get jobs => 'Jobs';

  @override
  String get jobDetail => 'Job details';

  @override
  String get accept => 'Accept';

  @override
  String get reject => 'Reject';

  @override
  String get pod => 'Proof of delivery';

  @override
  String get earnings => 'Earnings';

  @override
  String get profile => 'Profile';

  @override
  String get profileShort => 'Profile';

  @override
  String get settings => 'Settings';

  @override
  String get online => 'Online';

  @override
  String get offline => 'Offline';

  @override
  String get navigation => 'Navigation';

  @override
  String get logout => 'Sign out';

  @override
  String get noData => 'No data';

  @override
  String get submitPod => 'Submit delivery';

  @override
  String get loginSubtitle => 'Sign in to start delivering';

  @override
  String get invalidPhone => 'Enter a valid mobile number';

  @override
  String otpSentTo(String phone) {
    return 'Code sent to $phone';
  }

  @override
  String get driverMapLabel => 'Driver map';

  @override
  String get today => 'Today';

  @override
  String get currencySar => 'SAR';

  @override
  String offlineBannerMessage(int count) {
    return 'You\'re offline — $count action(s) will sync automatically';
  }

  @override
  String get syncNow => 'Sync now';

  @override
  String get enableOnline => 'Go online';

  @override
  String get disableOnline => 'Go offline';

  @override
  String get updateFailedQueued =>
      'Update failed — queued for sync when back online';

  @override
  String get youAreOnline => 'You\'re online';

  @override
  String get youAreOffline => 'You\'re offline';

  @override
  String get waitingForJobs => 'Waiting for nearby delivery requests';

  @override
  String get goOnlineHint => 'Go online to receive job offers';

  @override
  String get continueActiveJob => 'Continue active job';

  @override
  String get readyForJobs => 'Ready for jobs';

  @override
  String get goOnlineAction => 'Go online';

  @override
  String get noJobsTitle => 'No jobs right now';

  @override
  String get noJobsSubtitle => 'Go online on the map to receive offers';

  @override
  String get backToMap => 'Back to map';

  @override
  String distanceKm(String distance) {
    return '$distance km';
  }

  @override
  String earningsAmount(String amount) {
    return '$amount SAR';
  }

  @override
  String get jobRouteMap => 'Job route';

  @override
  String get activeJob => 'Active job';

  @override
  String get stepNavigate => 'Head to fill point / customer';

  @override
  String get stepFilled => 'Confirm tank filled';

  @override
  String get stepArrive => 'Confirm arrival at customer';

  @override
  String get stepPod => 'Complete proof of delivery';

  @override
  String get navigate => 'Navigate';

  @override
  String get filled => 'Tank filled';

  @override
  String get arrived => 'Arrived';

  @override
  String get fillStep => 'Fill';

  @override
  String get arriveStep => 'Arrive';

  @override
  String get podShort => 'POD';

  @override
  String get jobAction => 'Job action';

  @override
  String get queuedOffline => 'Queued — will sync when online';

  @override
  String get newJobOffer => 'New job offer';

  @override
  String get documentDelivery => 'Document delivery';

  @override
  String get podInstructions => 'Take a tank photo or get customer signature';

  @override
  String get photo => 'Photo';

  @override
  String get capture => 'Capture';

  @override
  String get signature => 'Signature';

  @override
  String get customer => 'Customer';

  @override
  String get done => 'Done';

  @override
  String get customerOtpOptional => 'Customer code (optional)';

  @override
  String get podRequired => 'Take a photo or capture signature first';

  @override
  String get podSuccess => 'Delivery confirmed successfully';

  @override
  String get podOfflineLabel => 'Proof of delivery';

  @override
  String get total => 'Total';

  @override
  String get trips => 'Trips';

  @override
  String get details => 'Details';

  @override
  String get noEarningsTitle => 'No earnings yet';

  @override
  String get noEarningsSubtitle => 'Complete jobs to see earnings here';

  @override
  String orderLabel(String orderId) {
    return 'Order $orderId';
  }

  @override
  String get locationTracking => 'Location tracking';

  @override
  String get active => 'Active';

  @override
  String get stopped => 'Stopped';

  @override
  String get offlineQueue => 'Offline queue';

  @override
  String pendingActions(int count) {
    return '$count pending action(s)';
  }

  @override
  String get sync => 'Sync';

  @override
  String get language => 'Language';

  @override
  String get languageArabic => 'العربية';

  @override
  String get languageEnglish => 'English';

  @override
  String get locationUpdate => 'Location update';

  @override
  String get demoTank18 => '18 ton';

  @override
  String get demoTank12 => '12 ton';

  @override
  String get demoAddress1 => 'Riyadh, Al Narjis';

  @override
  String get demoAddress2 => 'Riyadh, Al Yasmin';
}
