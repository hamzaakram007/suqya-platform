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
      mode: 'marketplace',
      status: 'active',
    },
    update: {},
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

  console.log('Seed completed.');
  console.log(`Default tenant ID: ${tenant.id}`);
  console.log(`Default city ID: ${city.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
