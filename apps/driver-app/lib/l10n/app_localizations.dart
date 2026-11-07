import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en')
  ];

  /// No description provided for @appTitle.
  ///
  /// In ar, this message translates to:
  /// **'سقيا - سائق'**
  String get appTitle;

  /// No description provided for @phoneLabel.
  ///
  /// In ar, this message translates to:
  /// **'رقم الجوال'**
  String get phoneLabel;

  /// No description provided for @sendOtp.
  ///
  /// In ar, this message translates to:
  /// **'إرسال رمز التحقق'**
  String get sendOtp;

  /// No description provided for @otpTitle.
  ///
  /// In ar, this message translates to:
  /// **'رمز التحقق'**
  String get otpTitle;

  /// No description provided for @enterCode.
  ///
  /// In ar, this message translates to:
  /// **'أدخل الرمز'**
  String get enterCode;

  /// No description provided for @confirm.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد'**
  String get confirm;

  /// No description provided for @jobs.
  ///
  /// In ar, this message translates to:
  /// **'الرحلات'**
  String get jobs;

  /// No description provided for @jobDetail.
  ///
  /// In ar, this message translates to:
  /// **'تفاصيل الرحلة'**
  String get jobDetail;

  /// No description provided for @accept.
  ///
  /// In ar, this message translates to:
  /// **'قبول'**
  String get accept;

  /// No description provided for @reject.
  ///
  /// In ar, this message translates to:
  /// **'رفض'**
  String get reject;

  /// No description provided for @pod.
  ///
  /// In ar, this message translates to:
  /// **'إثبات التسليم'**
  String get pod;

  /// No description provided for @earnings.
  ///
  /// In ar, this message translates to:
  /// **'الأرباح'**
  String get earnings;

  /// No description provided for @profile.
  ///
  /// In ar, this message translates to:
  /// **'الملف الشخصي'**
  String get profile;

  /// No description provided for @profileShort.
  ///
  /// In ar, this message translates to:
  /// **'الملف'**
  String get profileShort;

  /// No description provided for @settings.
  ///
  /// In ar, this message translates to:
  /// **'الإعدادات'**
  String get settings;

  /// No description provided for @online.
  ///
  /// In ar, this message translates to:
  /// **'متاح'**
  String get online;

  /// No description provided for @offline.
  ///
  /// In ar, this message translates to:
  /// **'غير متاح'**
  String get offline;

  /// No description provided for @navigation.
  ///
  /// In ar, this message translates to:
  /// **'التنقل'**
  String get navigation;

  /// No description provided for @logout.
  ///
  /// In ar, this message translates to:
  /// **'تسجيل الخروج'**
  String get logout;

  /// No description provided for @noData.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد بيانات'**
  String get noData;

  /// No description provided for @submitPod.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد التسليم'**
  String get submitPod;

  /// No description provided for @loginSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'سجّل دخولك لبدء التوصيل'**
  String get loginSubtitle;

  /// No description provided for @invalidPhone.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رقم جوال صحيح'**
  String get invalidPhone;

  /// No description provided for @otpSentTo.
  ///
  /// In ar, this message translates to:
  /// **'تم إرسال الرمز إلى {phone}'**
  String otpSentTo(String phone);

  /// No description provided for @driverMapLabel.
  ///
  /// In ar, this message translates to:
  /// **'خريطة السائق'**
  String get driverMapLabel;

  /// No description provided for @today.
  ///
  /// In ar, this message translates to:
  /// **'اليوم'**
  String get today;

  /// No description provided for @currencySar.
  ///
  /// In ar, this message translates to:
  /// **'ر.س'**
  String get currencySar;

  /// No description provided for @offlineBannerMessage.
  ///
  /// In ar, this message translates to:
  /// **'أنت دون اتصال — {count} عملية ستُزامَن تلقائياً'**
  String offlineBannerMessage(int count);

  /// No description provided for @syncNow.
  ///
  /// In ar, this message translates to:
  /// **'مزامنة الآن'**
  String get syncNow;

  /// No description provided for @enableOnline.
  ///
  /// In ar, this message translates to:
  /// **'تفعيل التواجد'**
  String get enableOnline;

  /// No description provided for @disableOnline.
  ///
  /// In ar, this message translates to:
  /// **'إيقاف التواجد'**
  String get disableOnline;

  /// No description provided for @updateFailedQueued.
  ///
  /// In ar, this message translates to:
  /// **'تعذر التحديث — أُضيف للطابور دون اتصال'**
  String get updateFailedQueued;

  /// No description provided for @youAreOnline.
  ///
  /// In ar, this message translates to:
  /// **'أنت متصل'**
  String get youAreOnline;

  /// No description provided for @youAreOffline.
  ///
  /// In ar, this message translates to:
  /// **'أنت غير متصل'**
  String get youAreOffline;

  /// No description provided for @waitingForJobs.
  ///
  /// In ar, this message translates to:
  /// **'بانتظار طلبات التوصيل القريبة'**
  String get waitingForJobs;

  /// No description provided for @goOnlineHint.
  ///
  /// In ar, this message translates to:
  /// **'فعّل التواجد لاستقبال الطلبات'**
  String get goOnlineHint;

  /// No description provided for @continueActiveJob.
  ///
  /// In ar, this message translates to:
  /// **'متابعة الرحلة النشطة'**
  String get continueActiveJob;

  /// No description provided for @readyForJobs.
  ///
  /// In ar, this message translates to:
  /// **'جاهز لاستقبال الطلبات'**
  String get readyForJobs;

  /// No description provided for @goOnlineAction.
  ///
  /// In ar, this message translates to:
  /// **'اذهب للعمل'**
  String get goOnlineAction;

  /// No description provided for @noJobsTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا رحلات حالياً'**
  String get noJobsTitle;

  /// No description provided for @noJobsSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'فعّل التواجد على الخريطة لاستقبال العروض'**
  String get noJobsSubtitle;

  /// No description provided for @backToMap.
  ///
  /// In ar, this message translates to:
  /// **'العودة للخريطة'**
  String get backToMap;

  /// No description provided for @distanceKm.
  ///
  /// In ar, this message translates to:
  /// **'{distance} كم'**
  String distanceKm(String distance);

  /// No description provided for @earningsAmount.
  ///
  /// In ar, this message translates to:
  /// **'{amount} ر.س'**
  String earningsAmount(String amount);

  /// No description provided for @jobRouteMap.
  ///
  /// In ar, this message translates to:
  /// **'مسار الرحلة'**
  String get jobRouteMap;

  /// No description provided for @activeJob.
  ///
  /// In ar, this message translates to:
  /// **'رحلة نشطة'**
  String get activeJob;

  /// No description provided for @stepNavigate.
  ///
  /// In ar, this message translates to:
  /// **'انتقل إلى نقطة التعبئة / العميل'**
  String get stepNavigate;

  /// No description provided for @stepFilled.
  ///
  /// In ar, this message translates to:
  /// **'أكد تعبئة الخزان'**
  String get stepFilled;

  /// No description provided for @stepArrive.
  ///
  /// In ar, this message translates to:
  /// **'أكد الوصول للعميل'**
  String get stepArrive;

  /// No description provided for @stepPod.
  ///
  /// In ar, this message translates to:
  /// **'أكمل إثبات التسليم'**
  String get stepPod;

  /// No description provided for @navigate.
  ///
  /// In ar, this message translates to:
  /// **'تنقّل'**
  String get navigate;

  /// No description provided for @filled.
  ///
  /// In ar, this message translates to:
  /// **'تم التعبئة'**
  String get filled;

  /// No description provided for @arrived.
  ///
  /// In ar, this message translates to:
  /// **'وصلت'**
  String get arrived;

  /// No description provided for @fillStep.
  ///
  /// In ar, this message translates to:
  /// **'تعبئة'**
  String get fillStep;

  /// No description provided for @arriveStep.
  ///
  /// In ar, this message translates to:
  /// **'وصول'**
  String get arriveStep;

  /// No description provided for @podShort.
  ///
  /// In ar, this message translates to:
  /// **'POD'**
  String get podShort;

  /// No description provided for @jobAction.
  ///
  /// In ar, this message translates to:
  /// **'إجراء رحلة'**
  String get jobAction;

  /// No description provided for @queuedOffline.
  ///
  /// In ar, this message translates to:
  /// **'أُضيف للطابور دون اتصال'**
  String get queuedOffline;

  /// No description provided for @newJobOffer.
  ///
  /// In ar, this message translates to:
  /// **'طلب جديد'**
  String get newJobOffer;

  /// No description provided for @documentDelivery.
  ///
  /// In ar, this message translates to:
  /// **'وثّق التسليم'**
  String get documentDelivery;

  /// No description provided for @podInstructions.
  ///
  /// In ar, this message translates to:
  /// **'التقط صورة الخزان أو احصل على توقيع العميل'**
  String get podInstructions;

  /// No description provided for @photo.
  ///
  /// In ar, this message translates to:
  /// **'صورة'**
  String get photo;

  /// No description provided for @capture.
  ///
  /// In ar, this message translates to:
  /// **'التقاط'**
  String get capture;

  /// No description provided for @signature.
  ///
  /// In ar, this message translates to:
  /// **'توقيع'**
  String get signature;

  /// No description provided for @customer.
  ///
  /// In ar, this message translates to:
  /// **'العميل'**
  String get customer;

  /// No description provided for @done.
  ///
  /// In ar, this message translates to:
  /// **'تم'**
  String get done;

  /// No description provided for @customerOtpOptional.
  ///
  /// In ar, this message translates to:
  /// **'رمز العميل (اختياري)'**
  String get customerOtpOptional;

  /// No description provided for @podRequired.
  ///
  /// In ar, this message translates to:
  /// **'التقط صورة أو وقّع أولاً'**
  String get podRequired;

  /// No description provided for @podSuccess.
  ///
  /// In ar, this message translates to:
  /// **'تم تأكيد التسليم بنجاح'**
  String get podSuccess;

  /// No description provided for @podOfflineLabel.
  ///
  /// In ar, this message translates to:
  /// **'إثبات تسليم'**
  String get podOfflineLabel;

  /// No description provided for @total.
  ///
  /// In ar, this message translates to:
  /// **'الإجمالي'**
  String get total;

  /// No description provided for @trips.
  ///
  /// In ar, this message translates to:
  /// **'الرحلات'**
  String get trips;

  /// No description provided for @details.
  ///
  /// In ar, this message translates to:
  /// **'التفاصيل'**
  String get details;

  /// No description provided for @noEarningsTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا أرباح بعد'**
  String get noEarningsTitle;

  /// No description provided for @noEarningsSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'أكمل رحلات لاستعراض الأرباح هنا'**
  String get noEarningsSubtitle;

  /// No description provided for @orderLabel.
  ///
  /// In ar, this message translates to:
  /// **'طلب {orderId}'**
  String orderLabel(String orderId);

  /// No description provided for @locationTracking.
  ///
  /// In ar, this message translates to:
  /// **'تتبع الموقع'**
  String get locationTracking;

  /// No description provided for @active.
  ///
  /// In ar, this message translates to:
  /// **'نشط'**
  String get active;

  /// No description provided for @stopped.
  ///
  /// In ar, this message translates to:
  /// **'متوقف'**
  String get stopped;

  /// No description provided for @offlineQueue.
  ///
  /// In ar, this message translates to:
  /// **'طابور دون اتصال'**
  String get offlineQueue;

  /// No description provided for @pendingActions.
  ///
  /// In ar, this message translates to:
  /// **'{count} عملية معلقة'**
  String pendingActions(int count);

  /// No description provided for @sync.
  ///
  /// In ar, this message translates to:
  /// **'مزامنة'**
  String get sync;

  /// No description provided for @language.
  ///
  /// In ar, this message translates to:
  /// **'اللغة'**
  String get language;

  /// No description provided for @languageArabic.
  ///
  /// In ar, this message translates to:
  /// **'العربية'**
  String get languageArabic;

  /// No description provided for @languageEnglish.
  ///
  /// In ar, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @locationUpdate.
  ///
  /// In ar, this message translates to:
  /// **'تحديث الموقع'**
  String get locationUpdate;

  /// No description provided for @demoTank18.
  ///
  /// In ar, this message translates to:
  /// **'18 طن'**
  String get demoTank18;

  /// No description provided for @demoTank12.
  ///
  /// In ar, this message translates to:
  /// **'12 طن'**
  String get demoTank12;

  /// No description provided for @demoAddress1.
  ///
  /// In ar, this message translates to:
  /// **'الرياض، حي النرجس'**
  String get demoAddress1;

  /// No description provided for @demoAddress2.
  ///
  /// In ar, this message translates to:
  /// **'الرياض، حي الياسمين'**
  String get demoAddress2;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
