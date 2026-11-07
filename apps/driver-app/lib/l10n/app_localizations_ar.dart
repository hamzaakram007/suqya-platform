// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'سقيا - سائق';

  @override
  String get phoneLabel => 'رقم الجوال';

  @override
  String get sendOtp => 'إرسال رمز التحقق';

  @override
  String get otpTitle => 'رمز التحقق';

  @override
  String get enterCode => 'أدخل الرمز';

  @override
  String get confirm => 'تأكيد';

  @override
  String get jobs => 'الرحلات';

  @override
  String get jobDetail => 'تفاصيل الرحلة';

  @override
  String get accept => 'قبول';

  @override
  String get reject => 'رفض';

  @override
  String get pod => 'إثبات التسليم';

  @override
  String get earnings => 'الأرباح';

  @override
  String get profile => 'الملف الشخصي';

  @override
  String get profileShort => 'الملف';

  @override
  String get settings => 'الإعدادات';

  @override
  String get online => 'متاح';

  @override
  String get offline => 'غير متاح';

  @override
  String get navigation => 'التنقل';

  @override
  String get logout => 'تسجيل الخروج';

  @override
  String get noData => 'لا توجد بيانات';

  @override
  String get submitPod => 'تأكيد التسليم';

  @override
  String get loginSubtitle => 'سجّل دخولك لبدء التوصيل';

  @override
  String get invalidPhone => 'أدخل رقم جوال صحيح';

  @override
  String otpSentTo(String phone) {
    return 'تم إرسال الرمز إلى $phone';
  }

  @override
  String get driverMapLabel => 'خريطة السائق';

  @override
  String get today => 'اليوم';

  @override
  String get currencySar => 'ر.س';

  @override
  String offlineBannerMessage(int count) {
    return 'أنت دون اتصال — $count عملية ستُزامَن تلقائياً';
  }

  @override
  String get syncNow => 'مزامنة الآن';

  @override
  String get enableOnline => 'تفعيل التواجد';

  @override
  String get disableOnline => 'إيقاف التواجد';

  @override
  String get updateFailedQueued => 'تعذر التحديث — أُضيف للطابور دون اتصال';

  @override
  String get youAreOnline => 'أنت متصل';

  @override
  String get youAreOffline => 'أنت غير متصل';

  @override
  String get waitingForJobs => 'بانتظار طلبات التوصيل القريبة';

  @override
  String get goOnlineHint => 'فعّل التواجد لاستقبال الطلبات';

  @override
  String get continueActiveJob => 'متابعة الرحلة النشطة';

  @override
  String get readyForJobs => 'جاهز لاستقبال الطلبات';

  @override
  String get goOnlineAction => 'اذهب للعمل';

  @override
  String get noJobsTitle => 'لا رحلات حالياً';

  @override
  String get noJobsSubtitle => 'فعّل التواجد على الخريطة لاستقبال العروض';

  @override
  String get backToMap => 'العودة للخريطة';

  @override
  String distanceKm(String distance) {
    return '$distance كم';
  }

  @override
  String earningsAmount(String amount) {
    return '$amount ر.س';
  }

  @override
  String get jobRouteMap => 'مسار الرحلة';

  @override
  String get activeJob => 'رحلة نشطة';

  @override
  String get stepNavigate => 'انتقل إلى نقطة التعبئة / العميل';

  @override
  String get stepFilled => 'أكد تعبئة الخزان';

  @override
  String get stepArrive => 'أكد الوصول للعميل';

  @override
  String get stepPod => 'أكمل إثبات التسليم';

  @override
  String get navigate => 'تنقّل';

  @override
  String get filled => 'تم التعبئة';

  @override
  String get arrived => 'وصلت';

  @override
  String get fillStep => 'تعبئة';

  @override
  String get arriveStep => 'وصول';

  @override
  String get podShort => 'POD';

  @override
  String get jobAction => 'إجراء رحلة';

  @override
  String get queuedOffline => 'أُضيف للطابور دون اتصال';

  @override
  String get newJobOffer => 'طلب جديد';

  @override
  String get documentDelivery => 'وثّق التسليم';

  @override
  String get podInstructions => 'التقط صورة الخزان أو احصل على توقيع العميل';

  @override
  String get photo => 'صورة';

  @override
  String get capture => 'التقاط';

  @override
  String get signature => 'توقيع';

  @override
  String get customer => 'العميل';

  @override
  String get done => 'تم';

  @override
  String get customerOtpOptional => 'رمز العميل (اختياري)';

  @override
  String get podRequired => 'التقط صورة أو وقّع أولاً';

  @override
  String get podSuccess => 'تم تأكيد التسليم بنجاح';

  @override
  String get podOfflineLabel => 'إثبات تسليم';

  @override
  String get total => 'الإجمالي';

  @override
  String get trips => 'الرحلات';

  @override
  String get details => 'التفاصيل';

  @override
  String get noEarningsTitle => 'لا أرباح بعد';

  @override
  String get noEarningsSubtitle => 'أكمل رحلات لاستعراض الأرباح هنا';

  @override
  String orderLabel(String orderId) {
    return 'طلب $orderId';
  }

  @override
  String get locationTracking => 'تتبع الموقع';

  @override
  String get active => 'نشط';

  @override
  String get stopped => 'متوقف';

  @override
  String get offlineQueue => 'طابور دون اتصال';

  @override
  String pendingActions(int count) {
    return '$count عملية معلقة';
  }

  @override
  String get sync => 'مزامنة';

  @override
  String get language => 'اللغة';

  @override
  String get languageArabic => 'العربية';

  @override
  String get languageEnglish => 'English';

  @override
  String get locationUpdate => 'تحديث الموقع';

  @override
  String get demoTank18 => '18 طن';

  @override
  String get demoTank12 => '12 طن';

  @override
  String get demoAddress1 => 'الرياض، حي النرجس';

  @override
  String get demoAddress2 => 'الرياض، حي الياسمين';
}
