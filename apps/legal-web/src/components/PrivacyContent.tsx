import type { Locale } from '@/lib/i18n';
import { copy } from '@/lib/i18n';

export function PrivacyContent({ locale }: { locale: Locale }) {
  const t = copy[locale];

  if (locale === 'ar') {
    return (
      <>
        <h1>{t.privacyTitle}</h1>
        <p className="meta">{t.updated}</p>
        <p className="lede">{t.privacyLede}</p>

        <h2>١. من نحن</h2>
        <p>
          سقيا منصة لطلب وتوصيل وايت الماء في المملكة العربية السعودية عبر تطبيقات
          الجوال (سقيا للعملاء وسقيا سائق) ولوحات الويب للمشغّلين والمورّدين.
        </p>

        <h2>٢. البيانات التي نجمعها</h2>
        <ul>
          <li>رقم الجوال لتسجيل الدخول عبر رمز لمرة واحدة (OTP).</li>
          <li>بيانات الحساب والملف الشخصي (الاسم، اللغة، تفضيلات الإشعارات).</li>
          <li>عنوان التوصيل والموقع التقريبي/الدقيق لتنفيذ الطلب والتتبع.</li>
          <li>تفاصيل الطلبات والفواتير الضريبية وسجل الدفع (بدون تخزين أرقام البطاقات الكاملة).</li>
          <li>موقع السائق أثناء المهمة لعرض التتبع الحي للعميل.</li>
          <li>صور إثبات التسليم عند الحاجة (للتطبيق الخاص بالسائق).</li>
          <li>سجلات تقنية محدودة للأمان والتشغيل (مثل سجلات التدقيق).</li>
        </ul>

        <h2>٣. أغراض المعالجة</h2>
        <ul>
          <li>إنشاء الحساب والمصادقة وإدارة الجلسات.</li>
          <li>تنفيذ الطلبات، التتبع، التحصيل، وإصدار الفواتير.</li>
          <li>التواصل حول حالة الطلب والدعم.</li>
          <li>الامتثال النظامي (مثل متطلبات الفوترة الإلكترونية وحماية البيانات).</li>
          <li>منع الاحتيال وتحسين أمن الخدمة.</li>
        </ul>

        <h2>٤. الأساس النظامي والموافقة</h2>
        <p>
          نعالج البيانات اللازمة لتنفيذ الخدمة التي طلبتها، وللالتزامات النظامية،
          وبناءً على موافقتك حيث يلزم (مثل تفضيلات التسويق أو بعض أذونات الجهاز).
          يمكنك إدارة تفضيلات الإشعارات والموافقة من داخل التطبيق عند توفرها.
        </p>

        <h2>٥. المعالجون والأطراف الثالثة</h2>
        <ul>
          <li>
            <strong>ميسر (Moyasar)</strong> — معالجة الدفع بالبطاقة؛ لا نخزّن أرقام
            البطاقات الكاملة على خوادم سقيا.
          </li>
          <li>
            <strong>يونيفونك / مزوّد رسائل SMS</strong> — إرسال رموز OTP ورسائل
            الخدمة عند تفعيل الوضع الحي.
          </li>
          <li>
            <strong>خرائط جوجل</strong> — عرض الخرائط عند تفعيل مفتاح الخرائط؛ وإلا
            تُستخدم واجهة تتبع بديلة.
          </li>
          <li>
            <strong>استضافة السحابة</strong> — تشغيل واجهة البرمجة ولوحات الويب
            (مثل Railway / Vercel وفق بيئة النشر).
          </li>
        </ul>

        <h2>٦. مكان الاحتفاظ بالبيانات</h2>
        <p>
          نستهدف استضافة بيانات التشغيل في مناطق متوافقة مع متطلبات الإقامة قدر
          الإمكان (هدف معماري: me-south-1 / الخليج). قد تمرّ بعض خدمات الطرف الثالث
          عبر مناطق أخرى حسب مزوّد الخدمة.
        </p>

        <h2>٧. حقوقك بموجب PDPL</h2>
        <ul>
          <li>الاطلاع على بياناتك الشخصية والحصول على نسخة (تصدير البيانات).</li>
          <li>طلب تصحيح البيانات غير الدقيقة.</li>
          <li>طلب حذف الحساب/البيانات (معالجة خلال ٣٠ يوماً حيث ينطبق).</li>
          <li>إدارة الموافقة وتفضيلات الإشعارات.</li>
        </ul>
        <p>
          من داخل التطبيق: الإعدادات ← الخصوصية ← تصدير البيانات / حذف الحساب.
          أو راسلنا عبر صفحة{' '}
          <a href="/support">الدعم</a>.
        </p>

        <h2>٨. الاحتفاظ والأمن</h2>
        <p>
          نحتفظ بالبيانات طالما لزم لتشغيل الخدمة أو للالتزامات النظامية
          والمحاسبية. نستخدم ضوابط تقنية وتنظيمية معقولة (تشفير أثناء النقل،
          صلاحيات حسب الدور، سجلات تدقيق). عند الاشتباه بخرق جوهري للبيانات
          الشخصية نتبع إجراءات الإخطار بما في ذلك إخطار الجهات المختصة خلال ٧٢
          ساعة حيث ينطبق.
        </p>

        <h2>٩. تطبيقات الجوال والأذونات</h2>
        <ul>
          <li>الموقع — عنوان التوصيل وتتبع السائق أثناء المهمة.</li>
          <li>الكاميرا — إثبات التسليم في تطبيق السائق.</li>
          <li>الإشعارات — حالة الطلب والتحديثات التشغيلية.</li>
        </ul>

        <h2>١٠. التواصل</h2>
        <p>
          للاستفسارات المتعلقة بالخصوصية:{' '}
          <a href="mailto:privacy@suqya.sa">privacy@suqya.sa</a> أو{' '}
          <a href="mailto:support@suqya.sa">support@suqya.sa</a>. صفحة الدعم:{' '}
          <a href="/support">/support</a>.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>{t.privacyTitle}</h1>
      <p className="meta">{t.updated}</p>
      <p className="lede">{t.privacyLede}</p>

      <h2>1. Who we are</h2>
      <p>
        Suqya (سقيا) is a water-tanker ordering and delivery platform in Saudi
        Arabia, delivered through the Suqya Customer and Suqya Driver mobile apps
        and operator/supplier web portals.
      </p>

      <h2>2. Data we collect</h2>
      <ul>
        <li>Mobile phone number for one-time-password (OTP) sign-in.</li>
        <li>Account/profile data (name, language, notification preferences).</li>
        <li>Delivery address and approximate/precise location for fulfillment and tracking.</li>
        <li>Order, tax-invoice, and payment records (we do not store full card PANs).</li>
        <li>Driver location while on an active job for live customer tracking.</li>
        <li>Proof-of-delivery photos when required (driver app).</li>
        <li>Limited technical/security logs (for example audit events).</li>
      </ul>

      <h2>3. Purposes of processing</h2>
      <ul>
        <li>Account creation, authentication, and session management.</li>
        <li>Order fulfillment, tracking, collection, and invoicing.</li>
        <li>Service communications and support.</li>
        <li>Regulatory compliance (for example e-invoicing and data-protection duties).</li>
        <li>Fraud prevention and service security.</li>
      </ul>

      <h2>4. Legal basis and consent</h2>
      <p>
        We process data needed to perform the service you request, to meet legal
        obligations, and based on consent where required (for example marketing
        preferences or certain device permissions). You can manage notification
        and consent preferences in-app when available.
      </p>

      <h2>5. Processors and third parties</h2>
      <ul>
        <li>
          <strong>Moyasar</strong> — card payment processing; Suqya does not store
          full card numbers on its servers.
        </li>
        <li>
          <strong>Unifonic / SMS provider</strong> — OTP and service SMS when live
          mode is enabled.
        </li>
        <li>
          <strong>Google Maps</strong> — map tiles when a Maps API key is
          configured; otherwise a sandbox tracking canvas is used.
        </li>
        <li>
          <strong>Cloud hosting</strong> — API and web hosting (for example Railway
          / Vercel depending on environment).
        </li>
      </ul>

      <h2>6. Where data is stored</h2>
      <p>
        We aim to host operational data in regions aligned with residency goals
        where practical (architectural target: AWS me-south-1 / GCC). Some
        third-party processors may process data in other regions according to
        their service configuration.
      </p>

      <h2>7. Your PDPL rights</h2>
      <ul>
        <li>Access your personal data and obtain a copy (data export).</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request account/data deletion (typically processed within 30 days where applicable).</li>
        <li>Manage consent and notification preferences.</li>
      </ul>
      <p>
        In-app path: Settings → Privacy → Export Data / Delete Account. Or contact
        us via the <a href="/en/support">Support</a> page.
      </p>

      <h2>8. Retention and security</h2>
      <p>
        We retain data as long as needed to operate the service or meet legal and
        accounting duties. We apply reasonable technical and organizational
        controls (TLS in transit, role-based access, audit logging). For material
        personal-data breaches we follow notification procedures, including
        notifying competent authorities within 72 hours where applicable.
      </p>

      <h2>9. Mobile permissions</h2>
      <ul>
        <li>Location — delivery address and live driver tracking while on a job.</li>
        <li>Camera — proof of delivery in the driver app.</li>
        <li>Notifications — order status and operational updates.</li>
      </ul>

      <h2>10. Contact</h2>
      <p>
        Privacy questions:{' '}
        <a href="mailto:privacy@suqya.sa">privacy@suqya.sa</a> or{' '}
        <a href="mailto:support@suqya.sa">support@suqya.sa</a>. Support page:{' '}
        <a href="/en/support">/en/support</a>.
      </p>
    </>
  );
}
