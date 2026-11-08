export type Locale = 'ar' | 'en';

export function otherLocale(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar';
}

export function localeDir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export const copy = {
  ar: {
    brand: 'سقيا',
    home: 'الرئيسية',
    privacy: 'سياسة الخصوصية',
    support: 'الدعم',
    langSwitch: 'English',
    homeTitle: 'سقيا — صفحات عامة للمتاجر',
    homeLede:
      'سياسة الخصوصية وصفحة الدعم لمتطلبات نشر تطبيقات سقيا (العميل والسائق) على Google Play وApp Store.',
    privacyTitle: 'سياسة الخصوصية',
    privacyLede: 'نوضح كيف تجمع سقيا البيانات الشخصية وتعالجها وتحميها وفق نظام حماية البيانات الشخصية (PDPL) في المملكة العربية السعودية.',
    supportTitle: 'الدعم وحذف الحساب',
    supportLede: 'تواصل مع فريق سقيا، أو اطلب تصدير بياناتك أو حذف حسابك.',
    updated: 'آخر تحديث: ٨ نوفمبر ٢٠٢٦',
    notLegalAdvice: 'هذه الصفحة ملخص تشغيلي للمستخدمين ومتاجر التطبيقات، وليست استشارة قانونية.',
  },
  en: {
    brand: 'Suqya',
    home: 'Home',
    privacy: 'Privacy Policy',
    support: 'Support',
    langSwitch: 'العربية',
    homeTitle: 'Suqya — public store pages',
    homeLede:
      'Privacy policy and support pages required for Suqya Customer and Suqya Driver listings on Google Play and the App Store.',
    privacyTitle: 'Privacy Policy',
    privacyLede:
      'How Suqya collects, uses, and protects personal data under Saudi Arabia’s Personal Data Protection Law (PDPL).',
    supportTitle: 'Support & account deletion',
    supportLede: 'Contact Suqya support, or request a data export or account deletion.',
    updated: 'Last updated: 8 November 2026',
    notLegalAdvice: 'This page is an operational summary for users and app stores — not legal advice.',
  },
} as const;
