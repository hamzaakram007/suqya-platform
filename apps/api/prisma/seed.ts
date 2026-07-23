import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const country = await prisma.country.upsert({
    where: { code: 'SA' },
    create: { code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia' },
    update: {},
  });

  const region = await prisma.region.upsert({
    where: { id: 'riyadh-region' },
    create: { id: 'riyadh-region', countryId: country.id, nameAr: 'منطقة الرياض', nameEn: 'Riyadh Region' },
    update: {},
  });

  const city = await prisma.city.upsert({
    where: { id: 'riyadh-city' },
    create: { id: 'riyadh-city', regionId: region.id, nameAr: 'الرياض', nameEn: 'Riyadh' },
    update: {},
  });

  const tenant = await prisma.tenant.upsert({
    where: { id: 'default-tenant' },
    create: {
      id: 'default-tenant',
      name: 'Suqya Marketplace',
      nameAr: 'سقيا - السوق',
      nameEn: 'Suqya Marketplace',
      mode: 'marketplace',
      status: 'active',
    },
    update: { nameEn: 'Suqya Marketplace', nameAr: 'سقيا - السوق' },
  });

  const tankSizes = [
    { capacityLiters: 6000, nameAr: '6 طن', nameEn: '6 Ton', price: 120 },
    { capacityLiters: 12000, nameAr: '12 طن', nameEn: '12 Ton', price: 180 },
    { capacityLiters: 18000, nameAr: '18 طن', nameEn: '18 Ton', price: 250 },
    { capacityLiters: 32000, nameAr: '32 طن', nameEn: '32 Ton', price: 400 },
  ];

  for (const ts of tankSizes) {
    await prisma.tankSize.upsert({
      where: { id: `tank-${ts.capacityLiters}` },
      create: {
        id: `tank-${ts.capacityLiters}`,
        tenantId: tenant.id,
        capacityLiters: ts.capacityLiters,
        nameAr: ts.nameAr,
        nameEn: ts.nameEn,
      },
      update: {},
    });
  }

  await prisma.waterType.upsert({
    where: { id: 'potable' },
    create: { id: 'potable', nameAr: 'مياه صالحة للشرب', nameEn: 'Potable Water', isPotable: true },
    update: {},
  });

  await prisma.pricingRule.upsert({
    where: { id: 'default-pricing' },
    create: {
      id: 'default-pricing',
      tenantId: tenant.id,
      name: 'Standard Pricing',
      ruleType: 'per_tank',
      basePrice: new Decimal(150),
    },
    update: {},
  });

  const permissions = [
    'orders.create', 'orders.read', 'orders.cancel',
    'admin.analytics', 'admin.tenants',
    'supplier.dashboard', 'driver.jobs',
  ];

  for (const slug of permissions) {
    await prisma.permission.upsert({
      where: { slug },
      create: { slug, description: slug },
      update: {},
    });
  }

  // Dev users — OTP login with phone + code 123456 (NODE_ENV=development)
  const devUsers = [
    { phone: '+966501234567', role: 'admin' as const, nameAr: 'مدير النظام', nameEn: 'Admin User' },
    { phone: '+966502345678', role: 'supplier' as const, nameAr: 'مورد تجريبي', nameEn: 'Demo Supplier' },
    { phone: '+966503456789', role: 'driver' as const, nameAr: 'سائق تجريبي', nameEn: 'Demo Driver' },
    { phone: '+966504567890', role: 'customer' as const, nameAr: 'عميل تجريبي', nameEn: 'Demo Customer' },
  ];

  for (const u of devUsers) {
    const user = await prisma.user.upsert({
      where: { tenantId_phone: { tenantId: tenant.id, phone: u.phone } },
      create: {
        tenantId: tenant.id,
        phone: u.phone,
        role: u.role,
        status: 'active',
        profile: { create: { nameAr: u.nameAr, nameEn: u.nameEn, preferredLanguage: 'ar' } },
      },
      update: { role: u.role, status: 'active' },
      include: { profile: true },
    });

    if (u.role === 'supplier') {
      await prisma.supplier.upsert({
        where: { userId: user.id },
        create: {
          tenantId: tenant.id,
          userId: user.id,
          companyName: 'مورد سقيا التجريبي',
          status: 'active',
        },
        update: {},
      });
    }

    if (u.role === 'driver') {
      const supplier = await prisma.supplier.findFirst({ where: { tenantId: tenant.id } });
      if (!supplier) {
        console.warn('Skipping driver seed — no supplier found');
        continue;
      }
      await prisma.driver.upsert({
        where: { userId: user.id },
        create: {
          tenantId: tenant.id,
          userId: user.id,
          supplierId: supplier.id,
          status: 'active',
          isOnline: true,
          latitude: 24.7136,
          longitude: 46.6753,
        },
        update: { isOnline: true },
      });
    }

    console.log(`Dev ${u.role}: ${u.phone}`);
  }

  const faqs = [
    {
      id: 'faq-order-how',
      category: 'orders',
      sortOrder: 1,
      questionAr: 'كيف أطلب وايت ماء؟',
      questionEn: 'How do I order a water tanker?',
      answerAr: 'من الصفحة الرئيسية اختر الموقع والحجم وطريقة الدفع ثم أكّد. العملاء العائدون يمكنهم التأكيد بثلاث نقرات أو أقل.',
      answerEn: 'From Home pick location, tank size, and payment, then confirm. Returning customers can confirm in three taps or fewer.',
    },
    {
      id: 'faq-payment',
      category: 'payments',
      sortOrder: 2,
      questionAr: 'ما طرق الدفع المتاحة؟',
      questionEn: 'What payment methods are available?',
      answerAr: 'نقداً عند التسليم، بطاقة عبر ميسر، محفظة سقيا، أو حساب آجل للعملاء المعتمدين.',
      answerEn: 'Cash on delivery, card via Moyasar, Suqya wallet, or credit account for approved customers.',
    },
    {
      id: 'faq-track',
      category: 'orders',
      sortOrder: 3,
      questionAr: 'كيف أتتبع طلبي؟',
      questionEn: 'How do I track my order?',
      answerAr: 'افتح الطلب من سجل الطلبات لعرض الخريطة الحية وحالة السائق.',
      answerEn: 'Open the order from Order History to see the live map and driver status.',
    },
    {
      id: 'faq-language',
      category: 'account',
      sortOrder: 4,
      questionAr: 'كيف أغيّر اللغة؟',
      questionEn: 'How do I change the language?',
      answerAr: 'من الإعدادات اختر العربية أو الإنجليزية. يتبدّل الاتجاه فوراً دون إعادة تشغيل التطبيق.',
      answerEn: 'In Settings choose Arabic or English. Layout direction flips instantly without restarting the app.',
    },
  ];

  for (const f of faqs) {
    await prisma.faq.upsert({
      where: { id: f.id },
      create: { ...f, tenantId: tenant.id, isActive: true },
      update: {
        questionAr: f.questionAr,
        questionEn: f.questionEn,
        answerAr: f.answerAr,
        answerEn: f.answerEn,
        category: f.category,
        sortOrder: f.sortOrder,
      },
    });
  }

  const templates = [
    {
      event: 'order.completed',
      channel: 'push',
      titleAr: 'تم إكمال الطلب',
      titleEn: 'Order completed',
      bodyAr: 'تم إكمال طلبك رقم {{orderNumber}} بنجاح',
      bodyEn: 'Your order {{orderNumber}} was completed successfully',
    },
    {
      event: 'order.dispatched',
      channel: 'push',
      titleAr: 'السائق في الطريق',
      titleEn: 'Driver on the way',
      bodyAr: 'طلبك {{orderNumber}} خرج للتوصيل',
      bodyEn: 'Your order {{orderNumber}} is out for delivery',
    },
    {
      event: 'ops.delayed_delivery',
      channel: 'in_app',
      titleAr: 'تأخير توصيل',
      titleEn: 'Delayed delivery',
      bodyAr: 'الطلب {{orderNumber}} تجاوز الوقت المتوقع',
      bodyEn: 'Order {{orderNumber}} exceeded expected delivery time',
    },
  ];

  for (const t of templates) {
    await prisma.notificationTemplate.upsert({
      where: { event_channel: { event: t.event, channel: t.channel } },
      create: t,
      update: {
        titleAr: t.titleAr,
        titleEn: t.titleEn,
        bodyAr: t.bodyAr,
        bodyEn: t.bodyEn,
      },
    });
  }

  console.log('Seed completed.');
  console.log(`Default tenant ID: ${tenant.id}`);
  console.log(`Default city ID: ${city.id}`);
  console.log('Dev OTP code: 123456 (when NODE_ENV=development)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
