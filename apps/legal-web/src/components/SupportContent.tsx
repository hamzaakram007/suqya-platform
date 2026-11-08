import type { Locale } from '@/lib/i18n';
import { copy } from '@/lib/i18n';

export function SupportContent({ locale }: { locale: Locale }) {
  const t = copy[locale];

  if (locale === 'ar') {
    return (
      <>
        <h1>{t.supportTitle}</h1>
        <p className="meta">{t.updated}</p>
        <p className="lede">{t.supportLede}</p>

        <h2>قنوات التواصل</h2>
        <div className="contact-grid">
          <div className="contact-item">
            <strong>البريد الإلكتروني للدعم</strong>
            <a href="mailto:support@suqya.sa">support@suqya.sa</a>
          </div>
          <div className="contact-item">
            <strong>خصوصية البيانات</strong>
            <a href="mailto:privacy@suqya.sa">privacy@suqya.sa</a>
          </div>
          <div className="contact-item">
            <strong>من داخل التطبيق</strong>
            الملف الشخصي ← الدعم ← تذكرة جديدة
          </div>
        </div>

        <h2>ساعات الاستجابة</h2>
        <p>
          نسعى للرد خلال يوم عمل واحد على طلبات الدعم العادية، وأسرع للحوادث
          المتعلقة بالطلبات الجارية أو الدفع.
        </p>

        <h2>حذف الحساب (متطلبات Google / Apple)</h2>
        <p>يمكنك طلب حذف حساب سقيا بإحدى الطرق التالية:</p>
        <ul>
          <li>
            من التطبيق: الإعدادات ← الخصوصية ← حذف الحساب (معالجة خلال ٣٠ يوماً
            حيث ينطبق).
          </li>
          <li>
            بالبريد: أرسل من رقم/بريد الحساب المسجّل إلى{' '}
            <a href="mailto:support@suqya.sa?subject=Account%20deletion%20request">
              support@suqya.sa
            </a>{' '}
            بعنوان «طلب حذف حساب» مع ذكر رقم الجوال المسجّل ونوع التطبيق (عميل /
            سائق).
          </li>
        </ul>
        <p>
          قد نحتفظ بحد أدنى من السجلات اللازمة للفوترة أو المتطلبات النظامية بعد
          حذف الحساب.
        </p>

        <h2>تصدير البيانات (PDPL)</h2>
        <p>
          من التطبيق: الإعدادات ← الخصوصية ← تصدير البيانات، أو راسل{' '}
          <a href="mailto:privacy@suqya.sa">privacy@suqya.sa</a>.
        </p>

        <h2>سياسة الخصوصية</h2>
        <p>
          راجع <a href="/privacy">سياسة الخصوصية</a> للتفاصيل حول جمع البيانات
          والمعالجين وحقوقك.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>{t.supportTitle}</h1>
      <p className="meta">{t.updated}</p>
      <p className="lede">{t.supportLede}</p>

      <h2>Contact channels</h2>
      <div className="contact-grid">
        <div className="contact-item">
          <strong>Support email</strong>
          <a href="mailto:support@suqya.sa">support@suqya.sa</a>
        </div>
        <div className="contact-item">
          <strong>Privacy</strong>
          <a href="mailto:privacy@suqya.sa">privacy@suqya.sa</a>
        </div>
        <div className="contact-item">
          <strong>In-app</strong>
          Profile → Support → New ticket
        </div>
      </div>

      <h2>Response times</h2>
      <p>
        We aim to reply within one business day for routine support, and faster
        for active order or payment incidents.
      </p>

      <h2>Account deletion (Google / Apple requirement)</h2>
      <p>You can request deletion of your Suqya account by:</p>
      <ul>
        <li>
          In-app: Settings → Privacy → Delete Account (typically processed within
          30 days where applicable).
        </li>
        <li>
          Email: write from your registered account contact to{' '}
          <a href="mailto:support@suqya.sa?subject=Account%20deletion%20request">
            support@suqya.sa
          </a>{' '}
          with subject “Account deletion request”, including your registered
          phone number and app (Customer / Driver).
        </li>
      </ul>
      <p>
        We may retain a minimal set of records required for invoicing or legal
        obligations after account deletion.
      </p>

      <h2>Data export (PDPL)</h2>
      <p>
        In-app: Settings → Privacy → Export Data, or email{' '}
        <a href="mailto:privacy@suqya.sa">privacy@suqya.sa</a>.
      </p>

      <h2>Privacy policy</h2>
      <p>
        See the <a href="/en/privacy">Privacy Policy</a> for collection,
        processors, and your rights.
      </p>
    </>
  );
}
