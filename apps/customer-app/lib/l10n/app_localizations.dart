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
  /// **'سقيا'**
  String get appTitle;

  /// No description provided for @appTagline.
  ///
  /// In ar, this message translates to:
  /// **'مياه نظيفة… إلى بابك'**
  String get appTagline;

  /// No description provided for @phoneLabel.
  ///
  /// In ar, this message translates to:
  /// **'رقم الجوال'**
  String get phoneLabel;

  /// No description provided for @phoneHint.
  ///
  /// In ar, this message translates to:
  /// **'5XXXXXXXX'**
  String get phoneHint;

  /// No description provided for @sendOtp.
  ///
  /// In ar, this message translates to:
  /// **'متابعة'**
  String get sendOtp;

  /// No description provided for @otpTitle.
  ///
  /// In ar, this message translates to:
  /// **'رمز التحقق'**
  String get otpTitle;

  /// No description provided for @otpSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'أدخل الرمز المرسل إلى جوالك'**
  String get otpSubtitle;

  /// No description provided for @otpHint.
  ///
  /// In ar, this message translates to:
  /// **'سنرسل رمز تحقق لمرة واحدة'**
  String get otpHint;

  /// No description provided for @enterCode.
  ///
  /// In ar, this message translates to:
  /// **'الرمز'**
  String get enterCode;

  /// No description provided for @confirm.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد'**
  String get confirm;

  /// No description provided for @confirmOrder.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد الطلب'**
  String get confirmOrder;

  /// No description provided for @smartReorder.
  ///
  /// In ar, this message translates to:
  /// **'طلب سريع — اختياراتك المحفوظة جاهزة'**
  String get smartReorder;

  /// No description provided for @welcome.
  ///
  /// In ar, this message translates to:
  /// **'أهلاً بك'**
  String get welcome;

  /// No description provided for @orderNow.
  ///
  /// In ar, this message translates to:
  /// **'اطلب الآن'**
  String get orderNow;

  /// No description provided for @homeTab.
  ///
  /// In ar, this message translates to:
  /// **'الرئيسية'**
  String get homeTab;

  /// No description provided for @trackTab.
  ///
  /// In ar, this message translates to:
  /// **'تتبع'**
  String get trackTab;

  /// No description provided for @accountTab.
  ///
  /// In ar, this message translates to:
  /// **'حسابي'**
  String get accountTab;

  /// No description provided for @orders.
  ///
  /// In ar, this message translates to:
  /// **'طلباتي'**
  String get orders;

  /// No description provided for @orderDetail.
  ///
  /// In ar, this message translates to:
  /// **'تفاصيل الطلب'**
  String get orderDetail;

  /// No description provided for @addresses.
  ///
  /// In ar, this message translates to:
  /// **'العناوين'**
  String get addresses;

  /// No description provided for @wallet.
  ///
  /// In ar, this message translates to:
  /// **'المحفظة'**
  String get wallet;

  /// No description provided for @support.
  ///
  /// In ar, this message translates to:
  /// **'الدعم'**
  String get support;

  /// No description provided for @notifications.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات'**
  String get notifications;

  /// No description provided for @settings.
  ///
  /// In ar, this message translates to:
  /// **'الإعدادات'**
  String get settings;

  /// No description provided for @coupons.
  ///
  /// In ar, this message translates to:
  /// **'الكوبونات'**
  String get coupons;

  /// No description provided for @credit.
  ///
  /// In ar, this message translates to:
  /// **'كشف حساب الآجل'**
  String get credit;

  /// No description provided for @invoices.
  ///
  /// In ar, this message translates to:
  /// **'الفواتير'**
  String get invoices;

  /// No description provided for @ratings.
  ///
  /// In ar, this message translates to:
  /// **'التقييمات'**
  String get ratings;

  /// No description provided for @recurringOrders.
  ///
  /// In ar, this message translates to:
  /// **'الطلبات المتكررة'**
  String get recurringOrders;

  /// No description provided for @favorites.
  ///
  /// In ar, this message translates to:
  /// **'المفضلة'**
  String get favorites;

  /// No description provided for @help.
  ///
  /// In ar, this message translates to:
  /// **'المساعدة'**
  String get help;

  /// No description provided for @faq.
  ///
  /// In ar, this message translates to:
  /// **'الأسئلة الشائعة'**
  String get faq;

  /// No description provided for @about.
  ///
  /// In ar, this message translates to:
  /// **'عن سقيا'**
  String get about;

  /// No description provided for @profile.
  ///
  /// In ar, this message translates to:
  /// **'حسابي'**
  String get profile;

  /// No description provided for @trackOrder.
  ///
  /// In ar, this message translates to:
  /// **'تتبع الطلب'**
  String get trackOrder;

  /// No description provided for @noActiveOrder.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد طلب نشط'**
  String get noActiveOrder;

  /// No description provided for @noActiveOrderHint.
  ///
  /// In ar, this message translates to:
  /// **'اطلب صهريجاً من الرئيسية لبدء التتبع الحي'**
  String get noActiveOrderHint;

  /// No description provided for @selectAddress.
  ///
  /// In ar, this message translates to:
  /// **'اختر العنوان'**
  String get selectAddress;

  /// No description provided for @selectTank.
  ///
  /// In ar, this message translates to:
  /// **'اختر الحجم'**
  String get selectTank;

  /// No description provided for @paymentMethod.
  ///
  /// In ar, this message translates to:
  /// **'طريقة الدفع'**
  String get paymentMethod;

  /// No description provided for @cashOnDelivery.
  ///
  /// In ar, this message translates to:
  /// **'نقداً عند التسليم'**
  String get cashOnDelivery;

  /// No description provided for @cardPay.
  ///
  /// In ar, this message translates to:
  /// **'بطاقة / مدى'**
  String get cardPay;

  /// No description provided for @creditPay.
  ///
  /// In ar, this message translates to:
  /// **'حساب آجل'**
  String get creditPay;

  /// No description provided for @applePay.
  ///
  /// In ar, this message translates to:
  /// **'Apple Pay'**
  String get applePay;

  /// No description provided for @googlePay.
  ///
  /// In ar, this message translates to:
  /// **'Google Pay'**
  String get googlePay;

  /// No description provided for @balance.
  ///
  /// In ar, this message translates to:
  /// **'الرصيد'**
  String get balance;

  /// No description provided for @topUp.
  ///
  /// In ar, this message translates to:
  /// **'شحن المحفظة'**
  String get topUp;

  /// No description provided for @addAddress.
  ///
  /// In ar, this message translates to:
  /// **'إضافة عنوان'**
  String get addAddress;

  /// No description provided for @newTicket.
  ///
  /// In ar, this message translates to:
  /// **'تذكرة جديدة'**
  String get newTicket;

  /// No description provided for @language.
  ///
  /// In ar, this message translates to:
  /// **'اللغة'**
  String get language;

  /// No description provided for @languageAr.
  ///
  /// In ar, this message translates to:
  /// **'العربية'**
  String get languageAr;

  /// No description provided for @languageEn.
  ///
  /// In ar, this message translates to:
  /// **'English'**
  String get languageEn;

  /// No description provided for @switchLanguage.
  ///
  /// In ar, this message translates to:
  /// **'تغيير اللغة'**
  String get switchLanguage;

  /// No description provided for @logout.
  ///
  /// In ar, this message translates to:
  /// **'تسجيل الخروج'**
  String get logout;

  /// No description provided for @noData.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد بيانات بعد'**
  String get noData;

  /// No description provided for @noOrders.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد طلبات'**
  String get noOrders;

  /// No description provided for @noOrdersHint.
  ///
  /// In ar, this message translates to:
  /// **'أول طلب لك على بُعد ثلاث نقرات'**
  String get noOrdersHint;

  /// No description provided for @noAddresses.
  ///
  /// In ar, this message translates to:
  /// **'لا عناوين محفوظة'**
  String get noAddresses;

  /// No description provided for @noAddressesHint.
  ///
  /// In ar, this message translates to:
  /// **'أضف عنوان توصيل لطلب أسرع'**
  String get noAddressesHint;

  /// No description provided for @noTickets.
  ///
  /// In ar, this message translates to:
  /// **'لا تذاكر دعم'**
  String get noTickets;

  /// No description provided for @noTicketsHint.
  ///
  /// In ar, this message translates to:
  /// **'نسعد بمساعدتك في أي وقت'**
  String get noTicketsHint;

  /// No description provided for @emptyNotifications.
  ///
  /// In ar, this message translates to:
  /// **'لا إشعارات'**
  String get emptyNotifications;

  /// No description provided for @emptyFaqs.
  ///
  /// In ar, this message translates to:
  /// **'لا أسئلة بعد'**
  String get emptyFaqs;

  /// No description provided for @emptyTankSizes.
  ///
  /// In ar, this message translates to:
  /// **'لا أحجام متاحة'**
  String get emptyTankSizes;

  /// No description provided for @emptyWalletActivity.
  ///
  /// In ar, this message translates to:
  /// **'ستظهر عمليات الشحن والدفع هنا'**
  String get emptyWalletActivity;

  /// No description provided for @emptyFavorites.
  ///
  /// In ar, this message translates to:
  /// **'لا مفضلة بعد'**
  String get emptyFavorites;

  /// No description provided for @retry.
  ///
  /// In ar, this message translates to:
  /// **'إعادة المحاولة'**
  String get retry;

  /// No description provided for @loading.
  ///
  /// In ar, this message translates to:
  /// **'جاري التحميل…'**
  String get loading;

  /// No description provided for @confirming.
  ///
  /// In ar, this message translates to:
  /// **'جاري التأكيد…'**
  String get confirming;

  /// No description provided for @adding.
  ///
  /// In ar, this message translates to:
  /// **'جاري الإضافة…'**
  String get adding;

  /// No description provided for @sending.
  ///
  /// In ar, this message translates to:
  /// **'جاري الإرسال…'**
  String get sending;

  /// No description provided for @errorGeneric.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ، حاول مرة أخرى'**
  String get errorGeneric;

  /// No description provided for @errorNetwork.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من الاتصال وحاول مرة أخرى'**
  String get errorNetwork;

  /// No description provided for @errorLoadData.
  ///
  /// In ar, this message translates to:
  /// **'تعذر تحميل البيانات'**
  String get errorLoadData;

  /// No description provided for @errorLoadOrders.
  ///
  /// In ar, this message translates to:
  /// **'تعذر تحميل الطلبات'**
  String get errorLoadOrders;

  /// No description provided for @errorLoadAddresses.
  ///
  /// In ar, this message translates to:
  /// **'تعذر تحميل العناوين'**
  String get errorLoadAddresses;

  /// No description provided for @errorLoadWallet.
  ///
  /// In ar, this message translates to:
  /// **'تعذر تحميل المحفظة'**
  String get errorLoadWallet;

  /// No description provided for @errorLoadTickets.
  ///
  /// In ar, this message translates to:
  /// **'تعذر تحميل التذاكر'**
  String get errorLoadTickets;

  /// No description provided for @errorLoadFaqs.
  ///
  /// In ar, this message translates to:
  /// **'تعذر تحميل الأسئلة الشائعة'**
  String get errorLoadFaqs;

  /// No description provided for @errorLoad.
  ///
  /// In ar, this message translates to:
  /// **'تعذر التحميل'**
  String get errorLoad;

  /// No description provided for @errorCreateOrder.
  ///
  /// In ar, this message translates to:
  /// **'تعذر إنشاء الطلب'**
  String get errorCreateOrder;

  /// No description provided for @errorAddAddress.
  ///
  /// In ar, this message translates to:
  /// **'تعذر إضافة العنوان'**
  String get errorAddAddress;

  /// No description provided for @errorCreateTicket.
  ///
  /// In ar, this message translates to:
  /// **'تعذر إنشاء التذكرة'**
  String get errorCreateTicket;

  /// No description provided for @errorTrackOrder.
  ///
  /// In ar, this message translates to:
  /// **'تعذر تتبع الطلب'**
  String get errorTrackOrder;

  /// No description provided for @errorTopUp.
  ///
  /// In ar, this message translates to:
  /// **'تعذر الشحن'**
  String get errorTopUp;

  /// No description provided for @errorInvalidPhone.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رقم جوال سعودي صحيح'**
  String get errorInvalidPhone;

  /// No description provided for @errorOtpSendFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذر إرسال الرمز. حاول مرة أخرى.'**
  String get errorOtpSendFailed;

  /// No description provided for @errorOtpIncomplete.
  ///
  /// In ar, this message translates to:
  /// **'أدخل الرمز كاملاً'**
  String get errorOtpIncomplete;

  /// No description provided for @errorOtpInvalid.
  ///
  /// In ar, this message translates to:
  /// **'رمز غير صحيح. حاول مجدداً.'**
  String get errorOtpInvalid;

  /// No description provided for @defaultCustomerName.
  ///
  /// In ar, this message translates to:
  /// **'عميل سقيا'**
  String get defaultCustomerName;

  /// No description provided for @yourServices.
  ///
  /// In ar, this message translates to:
  /// **'خدماتك'**
  String get yourServices;

  /// No description provided for @helpAndSettings.
  ///
  /// In ar, this message translates to:
  /// **'المساعدة والإعدادات'**
  String get helpAndSettings;

  /// No description provided for @pushNotifications.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات الفورية'**
  String get pushNotifications;

  /// No description provided for @pushNotificationsHint.
  ///
  /// In ar, this message translates to:
  /// **'تلقي تحديثات الطلبات'**
  String get pushNotificationsHint;

  /// No description provided for @appearance.
  ///
  /// In ar, this message translates to:
  /// **'المظهر'**
  String get appearance;

  /// No description provided for @themeSystem.
  ///
  /// In ar, this message translates to:
  /// **'تلقائي'**
  String get themeSystem;

  /// No description provided for @themeLight.
  ///
  /// In ar, this message translates to:
  /// **'فاتح'**
  String get themeLight;

  /// No description provided for @themeDark.
  ///
  /// In ar, this message translates to:
  /// **'داكن'**
  String get themeDark;

  /// No description provided for @biometricUnlock.
  ///
  /// In ar, this message translates to:
  /// **'فتح بالبصمة / Face ID'**
  String get biometricUnlock;

  /// No description provided for @biometricUnlockHint.
  ///
  /// In ar, this message translates to:
  /// **'حماية سريعة عند العودة للتطبيق'**
  String get biometricUnlockHint;

  /// No description provided for @addressFallback.
  ///
  /// In ar, this message translates to:
  /// **'عنوان'**
  String get addressFallback;

  /// No description provided for @defaultBadge.
  ///
  /// In ar, this message translates to:
  /// **'افتراضي'**
  String get defaultBadge;

  /// No description provided for @litersUnit.
  ///
  /// In ar, this message translates to:
  /// **'{liters} لتر'**
  String litersUnit(String liters);

  /// No description provided for @statusDelivered.
  ///
  /// In ar, this message translates to:
  /// **'تم التسليم'**
  String get statusDelivered;

  /// No description provided for @statusDriverArrived.
  ///
  /// In ar, this message translates to:
  /// **'وصل السائق'**
  String get statusDriverArrived;

  /// No description provided for @statusInTransit.
  ///
  /// In ar, this message translates to:
  /// **'في الطريق إليك'**
  String get statusInTransit;

  /// No description provided for @statusDriverAssigned.
  ///
  /// In ar, this message translates to:
  /// **'تم تعيين السائق'**
  String get statusDriverAssigned;

  /// No description provided for @statusConfirmed.
  ///
  /// In ar, this message translates to:
  /// **'تم تأكيد الطلب'**
  String get statusConfirmed;

  /// No description provided for @statusPending.
  ///
  /// In ar, this message translates to:
  /// **'قيد الانتظار'**
  String get statusPending;

  /// No description provided for @statusUpdating.
  ///
  /// In ar, this message translates to:
  /// **'جاري التحديث…'**
  String get statusUpdating;

  /// No description provided for @statusCompleted.
  ///
  /// In ar, this message translates to:
  /// **'مكتمل'**
  String get statusCompleted;

  /// No description provided for @statusCancelled.
  ///
  /// In ar, this message translates to:
  /// **'ملغي'**
  String get statusCancelled;

  /// No description provided for @statusOnRoute.
  ///
  /// In ar, this message translates to:
  /// **'في الطريق'**
  String get statusOnRoute;

  /// No description provided for @waterOrder.
  ///
  /// In ar, this message translates to:
  /// **'طلب مياه'**
  String get waterOrder;

  /// No description provided for @orderNumber.
  ///
  /// In ar, this message translates to:
  /// **'طلب #{id}'**
  String orderNumber(String id);

  /// No description provided for @labelStatus.
  ///
  /// In ar, this message translates to:
  /// **'الحالة'**
  String get labelStatus;

  /// No description provided for @labelSize.
  ///
  /// In ar, this message translates to:
  /// **'الحجم'**
  String get labelSize;

  /// No description provided for @labelPayment.
  ///
  /// In ar, this message translates to:
  /// **'الدفع'**
  String get labelPayment;

  /// No description provided for @labelTotal.
  ///
  /// In ar, this message translates to:
  /// **'المجموع'**
  String get labelTotal;

  /// No description provided for @deliveryAddress.
  ///
  /// In ar, this message translates to:
  /// **'عنوان التوصيل'**
  String get deliveryAddress;

  /// No description provided for @zatcaInvoice.
  ///
  /// In ar, this message translates to:
  /// **'فاتورة زاتكا / QR'**
  String get zatcaInvoice;

  /// No description provided for @scanQrHint.
  ///
  /// In ar, this message translates to:
  /// **'امسح الرمز للتحقق من الفاتورة'**
  String get scanQrHint;

  /// No description provided for @topUpSuccess.
  ///
  /// In ar, this message translates to:
  /// **'تم شحن {amount} ر.س'**
  String topUpSuccess(String amount);

  /// No description provided for @recentActivity.
  ///
  /// In ar, this message translates to:
  /// **'الحركة الأخيرة'**
  String get recentActivity;

  /// No description provided for @transactionFallback.
  ///
  /// In ar, this message translates to:
  /// **'حركة'**
  String get transactionFallback;

  /// No description provided for @ticketFallback.
  ///
  /// In ar, this message translates to:
  /// **'تذكرة'**
  String get ticketFallback;

  /// No description provided for @defaultTicketSubject.
  ///
  /// In ar, this message translates to:
  /// **'استفسار عن طلب'**
  String get defaultTicketSubject;

  /// No description provided for @defaultTicketMessage.
  ///
  /// In ar, this message translates to:
  /// **'أحتاج مساعدة بخصوص آخر طلب'**
  String get defaultTicketMessage;

  /// No description provided for @version.
  ///
  /// In ar, this message translates to:
  /// **'الإصدار 0.1.0'**
  String get version;

  /// No description provided for @aboutDescription.
  ///
  /// In ar, this message translates to:
  /// **'سقيا — منصة توصيل صهاريج المياه في المملكة العربية السعودية. نوفر خدمة سريعة وموثوقة لتوصيل المياه إلى باب منزلك.'**
  String get aboutDescription;

  /// No description provided for @copyright.
  ///
  /// In ar, this message translates to:
  /// **'© 2026 سقيا. جميع الحقوق محفوظة.'**
  String get copyright;

  /// No description provided for @couponCodeLabel.
  ///
  /// In ar, this message translates to:
  /// **'رمز الكوبون'**
  String get couponCodeLabel;

  /// No description provided for @validateCoupon.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من الكوبون'**
  String get validateCoupon;

  /// No description provided for @couponValid.
  ///
  /// In ar, this message translates to:
  /// **'كوبون صالح: {code}'**
  String couponValid(String code);

  /// No description provided for @discountAmount.
  ///
  /// In ar, this message translates to:
  /// **'الخصم: {amount} ر.س'**
  String discountAmount(String amount);

  /// No description provided for @creditLimit.
  ///
  /// In ar, this message translates to:
  /// **'الحد'**
  String get creditLimit;

  /// No description provided for @creditUsed.
  ///
  /// In ar, this message translates to:
  /// **'المستخدم'**
  String get creditUsed;

  /// No description provided for @creditAvailable.
  ///
  /// In ar, this message translates to:
  /// **'المتاح'**
  String get creditAvailable;

  /// No description provided for @invoiceNumber.
  ///
  /// In ar, this message translates to:
  /// **'فاتورة #{number}'**
  String invoiceNumber(String number);

  /// No description provided for @thanksForRating.
  ///
  /// In ar, this message translates to:
  /// **'شكراً على تقييمك'**
  String get thanksForRating;

  /// No description provided for @orderIdLabel.
  ///
  /// In ar, this message translates to:
  /// **'رقم الطلب'**
  String get orderIdLabel;

  /// No description provided for @ratingLabel.
  ///
  /// In ar, this message translates to:
  /// **'التقييم'**
  String get ratingLabel;

  /// No description provided for @commentOptional.
  ///
  /// In ar, this message translates to:
  /// **'تعليق (اختياري)'**
  String get commentOptional;

  /// No description provided for @submitRating.
  ///
  /// In ar, this message translates to:
  /// **'إرسال التقييم'**
  String get submitRating;

  /// No description provided for @activeSubscription.
  ///
  /// In ar, this message translates to:
  /// **'اشتراك نشط'**
  String get activeSubscription;

  /// No description provided for @planLabel.
  ///
  /// In ar, this message translates to:
  /// **'الخطة: {name}'**
  String planLabel(String name);

  /// No description provided for @frequencyLabel.
  ///
  /// In ar, this message translates to:
  /// **'التكرار: {frequency}'**
  String frequencyLabel(String frequency);

  /// No description provided for @frequencyWeekly.
  ///
  /// In ar, this message translates to:
  /// **'أسبوعي'**
  String get frequencyWeekly;

  /// No description provided for @perMonth.
  ///
  /// In ar, this message translates to:
  /// **'شهر'**
  String get perMonth;

  /// No description provided for @etaMinutes.
  ///
  /// In ar, this message translates to:
  /// **'الوصول خلال {minutes} دقيقة'**
  String etaMinutes(String minutes);

  /// No description provided for @sar.
  ///
  /// In ar, this message translates to:
  /// **'{amount} ر.س'**
  String sar(String amount);
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
