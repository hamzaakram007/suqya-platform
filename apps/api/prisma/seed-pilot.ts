/**
 * Phase 1 (Internal Alpha) pilot ops seed — idempotent.
 *
 * Creates / refreshes:
 * - Geography + default tenant + catalog (same as base seed)
 * - Admin + E2E-compatible demo phones (so `npm run e2e:foundation` still works)
 * - 2 suppliers with CR/VAT placeholder docs (launch-plan Phase 1)
 * - 10 drivers (5 per supplier) with trucks + Riyadh GPS spread
 * - 5 pilot customers with addresses
 * - 2 sample orders in `supplier_review` for admin dry-run
 *
 * Usage (from repo root, after migrate):
 *   npm run db:seed:pilot
 *
 * Safe to re-run. Fixed IDs / phones are the upsert keys.
 * Works against local Compose (5433) or any DATABASE_URL (staging when available).
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const TENANT_ID = 'default-tenant';
const CITY_ID = 'riyadh-city';

/** Stable pilot phone book — document in docs/testing/pilot-ops.md */
export const PILOT_PHONES = {
  admin: '+966501234567',
  /** E2E / Supplier 1 portal login */
  supplier1: '+966502345678',
  supplier2: '+966511000002',
  /** E2E driver (Supplier 1, driver 01) */
  driver1: '+966503456789',
  /** E2E customer */
  customerE2e: '+966504567890',
} as const;

const SUPPLIERS: Array<{
  id: string;
  phone: string;
  companyName: string;
  ownerName: string;
  nameAr: string;
  nameEn: string;
  cr: string;
  vat: string;
  lat: number;
  lng: number;
}> = [
  {
    id: 'pilot-supplier-alnour',
    phone: PILOT_PHONES.supplier1,
    companyName: 'مياه النور',
    ownerName: 'أحمد النور',
    nameAr: 'مورد النور',
    nameEn: 'Al-Nour Water',
    cr: '1010123456',
    vat: '300123456700003',
    lat: 24.7136,
    lng: 46.6753,
  },
  {
    id: 'pilot-supplier-najd',
    phone: PILOT_PHONES.supplier2,
    companyName: 'نجد النقية',
    ownerName: 'خالد النجدي',
    nameAr: 'مورد نجد',
    nameEn: 'Najd Pure Water',
    cr: '1010654321',
    vat: '300765432100003',
    lat: 24.6877,
    lng: 46.7219,
  },
];

type DriverSpec = {
  id: string;
  phone: string;
  nameAr: string;
  nameEn: string;
  supplierId: string;
  truckId: string;
  plate: string;
  license: string;
  lat: number;
  lng: number;
  online: boolean;
};

/** 10 drivers — 5 per supplier. Index 0 keeps E2E phone. */
function buildDrivers(): DriverSpec[] {
  const riyadhSpread: Array<[number, number]> = [
    [24.7136, 46.6753],
    [24.7250, 46.6600],
    [24.7000, 46.6900],
    [24.7400, 46.7100],
    [24.6800, 46.7000],
    [24.6877, 46.7219],
    [24.6700, 46.7400],
    [24.7050, 46.7500],
    [24.6500, 46.7100],
    [24.7300, 46.7800],
  ];

  const drivers: DriverSpec[] = [];
  for (let i = 0; i < 10; i++) {
    const n = i + 1;
    const supplier = SUPPLIERS[i < 5 ? 0 : 1];
    const [lat, lng] = riyadhSpread[i];
    const phone =
      n === 1
        ? PILOT_PHONES.driver1
        : `+966511001${String(n).padStart(3, '0')}`;
    drivers.push({
      id: `pilot-driver-${String(n).padStart(2, '0')}`,
      phone,
      nameAr: `سائق تجريبي ${n}`,
      nameEn: `Pilot Driver ${n}`,
      supplierId: supplier.id,
      truckId: `pilot-truck-${String(n).padStart(2, '0')}`,
      plate: `PILOT-${String(n).padStart(2, '0')}`,
      license: `DL-PILOT-${String(n).padStart(4, '0')}`,
      lat,
      lng,
      online: n <= 6, // first 6 online for dispatch dry-run
    });
  }
  return drivers;
}

const CUSTOMERS: Array<{
  id: string;
  phone: string;
  nameAr: string;
  nameEn: string;
  label: string;
  street: string;
  building: string;
  lat: number;
  lng: number;
}> = [
  {
    id: 'pilot-customer-e2e',
    phone: PILOT_PHONES.customerE2e,
    nameAr: 'عميل تجريبي',
    nameEn: 'Demo Customer',
    label: 'Demo Home',
    street: 'Olaya St',
    building: '1001',
    lat: 24.72,
    lng: 46.68,
  },
  {
    id: 'pilot-customer-02',
    phone: '+966511002002',
    nameAr: 'فاطمة العتيبي',
    nameEn: 'Fatima Al-Otaibi',
    label: 'Home',
    street: 'King Fahd Rd',
    building: '2048',
    lat: 24.735,
    lng: 46.665,
  },
  {
    id: 'pilot-customer-03',
    phone: '+966511002003',
    nameAr: 'محمد الشمري',
    nameEn: 'Mohammed Al-Shammari',
    label: 'Office',
    street: 'Tahlia St',
    building: '55',
    lat: 24.695,
    lng: 46.685,
  },
  {
    id: 'pilot-customer-04',
    phone: '+966511002004',
    nameAr: 'نورة القحطاني',
    nameEn: 'Noura Al-Qahtani',
    label: 'Villa',
    street: 'Diplomatic Quarter',
    building: '12',
    lat: 24.68,
    lng: 46.62,
  },
  {
    id: 'pilot-customer-05',
    phone: '+966511002005',
    nameAr: 'سعد الدوسري',
    nameEn: 'Saad Al-Dosari',
    label: 'Warehouse',
    street: 'Second Industrial City',
    building: '9',
    lat: 24.65,
    lng: 46.75,
  },
];

async function ensureCatalog() {
  const country = await prisma.country.upsert({
    where: { code: 'SA' },
    create: {
      code: 'SA',
      nameAr: 'المملكة العربية السعودية',
      nameEn: 'Saudi Arabia',
    },
    update: {},
  });

  await prisma.region.upsert({
    where: { id: 'riyadh-region' },
    create: {
      id: 'riyadh-region',
      countryId: country.id,
      nameAr: 'منطقة الرياض',
      nameEn: 'Riyadh Region',
    },
    update: {},
  });

  const city = await prisma.city.upsert({
    where: { id: CITY_ID },
    create: {
      id: CITY_ID,
      regionId: 'riyadh-region',
      nameAr: 'الرياض',
      nameEn: 'Riyadh',
    },
    update: {},
  });

  const tenant = await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    create: {
      id: TENANT_ID,
      name: 'Suqya Marketplace',
      nameAr: 'سقيا - السوق',
      nameEn: 'Suqya Marketplace',
      mode: 'marketplace',
      status: 'active',
    },
    update: {
      nameEn: 'Suqya Marketplace',
      nameAr: 'سقيا - السوق',
      status: 'active',
    },
  });

  const tankSizes = [
    { capacityLiters: 6000, nameAr: '6 طن', nameEn: '6 Ton' },
    { capacityLiters: 12000, nameAr: '12 طن', nameEn: '12 Ton' },
    { capacityLiters: 18000, nameAr: '18 طن', nameEn: '18 Ton' },
    { capacityLiters: 32000, nameAr: '32 طن', nameEn: '32 Ton' },
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
    create: {
      id: 'potable',
      nameAr: 'مياه صالحة للشرب',
      nameEn: 'Potable Water',
      isPotable: true,
    },
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
    'orders.create',
    'orders.read',
    'orders.cancel',
    'admin.analytics',
    'admin.tenants',
    'supplier.dashboard',
    'driver.jobs',
  ];
  for (const slug of permissions) {
    await prisma.permission.upsert({
      where: { slug },
      create: { slug, description: slug },
      update: {},
    });
  }

  return { tenant, city };
}

async function upsertUser(opts: {
  phone: string;
  role: 'admin' | 'supplier' | 'driver' | 'customer';
  nameAr: string;
  nameEn: string;
  email?: string;
}) {
  return prisma.user.upsert({
    where: { tenantId_phone: { tenantId: TENANT_ID, phone: opts.phone } },
    create: {
      tenantId: TENANT_ID,
      phone: opts.phone,
      email: opts.email,
      role: opts.role,
      status: 'active',
      profile: {
        create: {
          nameAr: opts.nameAr,
          nameEn: opts.nameEn,
          preferredLanguage: 'ar',
        },
      },
    },
    update: {
      role: opts.role,
      status: 'active',
      email: opts.email,
      profile: {
        upsert: {
          create: {
            nameAr: opts.nameAr,
            nameEn: opts.nameEn,
            preferredLanguage: 'ar',
          },
          update: { nameAr: opts.nameAr, nameEn: opts.nameEn },
        },
      },
    },
  });
}

async function seedSuppliers() {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 1);

  for (const s of SUPPLIERS) {
    const user = await upsertUser({
      phone: s.phone,
      role: 'supplier',
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      email: `${s.id.replace('pilot-supplier-', '')}@pilot.suqya.sa`,
    });

    // Prefer stable supplier id; if an older seed created a different row for this
    // user, update that row in place so userId uniqueness is preserved.
    const byUser = await prisma.supplier.findUnique({ where: { userId: user.id } });
    let supplier;
    if (byUser && byUser.id !== s.id) {
      supplier = await prisma.supplier.update({
        where: { id: byUser.id },
        data: {
          companyName: s.companyName,
          ownerName: s.ownerName,
          commercialRegistration: s.cr,
          vatNumber: s.vat,
          status: 'active',
          latitude: s.lat,
          longitude: s.lng,
          workingHoursStart: '06:00',
          workingHoursEnd: '22:00',
          commissionRate: new Decimal(10),
        },
      });
      console.log(`  supplier ${s.nameEn}: remapped existing row ${byUser.id} (phone ${s.phone})`);
    } else {
      supplier = await prisma.supplier.upsert({
        where: { id: s.id },
        create: {
          id: s.id,
          tenantId: TENANT_ID,
          userId: user.id,
          companyName: s.companyName,
          ownerName: s.ownerName,
          commercialRegistration: s.cr,
          vatNumber: s.vat,
          status: 'active',
          latitude: s.lat,
          longitude: s.lng,
          workingHoursStart: '06:00',
          workingHoursEnd: '22:00',
          commissionRate: new Decimal(10),
        },
        update: {
          companyName: s.companyName,
          ownerName: s.ownerName,
          commercialRegistration: s.cr,
          vatNumber: s.vat,
          status: 'active',
          latitude: s.lat,
          longitude: s.lng,
          workingHoursStart: '06:00',
          workingHoursEnd: '22:00',
        },
      });
    }

    // Keep SUPPLIERS[].id aligned with DB for downstream truck/driver FKs
    (s as { id: string }).id = supplier.id;

    for (const doc of [
      { type: 'commercial_registration', url: `sandbox://docs/${s.id}/cr.pdf` },
      { type: 'vat_certificate', url: `sandbox://docs/${s.id}/vat.pdf` },
      { type: 'water_quality', url: `sandbox://docs/${s.id}/quality.pdf` },
    ]) {
      const existing = await prisma.supplierDocument.findFirst({
        where: { supplierId: supplier.id, type: doc.type },
      });
      if (existing) {
        await prisma.supplierDocument.update({
          where: { id: existing.id },
          data: {
            documentUrl: doc.url,
            expiresAt: expiry,
            verifiedAt: now,
          },
        });
      } else {
        await prisma.supplierDocument.create({
          data: {
            supplierId: supplier.id,
            type: doc.type,
            documentUrl: doc.url,
            expiresAt: expiry,
            verifiedAt: now,
          },
        });
      }
    }

    const waterSourceId = `${supplier.id}-source-potable`;
    await prisma.waterSource.upsert({
      where: { id: waterSourceId },
      create: {
        id: waterSourceId,
        supplierId: supplier.id,
        name: `${s.companyName} — Potable`,
        waterTypeId: 'potable',
        latitude: s.lat,
        longitude: s.lng,
      },
      update: {
        name: `${s.companyName} — Potable`,
        latitude: s.lat,
        longitude: s.lng,
      },
    });

    console.log(`  supplier ${s.nameEn}: ${s.phone} (CR ${s.cr})`);
  }

  return SUPPLIERS;
}

async function seedDriversAndTrucks() {
  // Call after seedSuppliers() so SUPPLIERS[].id reflects any remapped rows.
  const drivers = buildDrivers();
  const supplierLabel = new Map(SUPPLIERS.map((s) => [s.id, s.nameEn]));

  for (const d of drivers) {
    const supplierId = d.supplierId;
    if (!supplierLabel.has(supplierId)) {
      throw new Error(`Driver ${d.id} references unknown supplier ${supplierId}`);
    }

    await prisma.truck.upsert({
      where: { id: d.truckId },
      create: {
        id: d.truckId,
        supplierId,
        plateNumber: d.plate,
        capacityLiters: 12000,
        status: 'active',
      },
      update: {
        supplierId,
        plateNumber: d.plate,
        capacityLiters: 12000,
        status: 'active',
      },
    });

    const user = await upsertUser({
      phone: d.phone,
      role: 'driver',
      nameAr: d.nameAr,
      nameEn: d.nameEn,
    });

    const byUser = await prisma.driver.findUnique({ where: { userId: user.id } });
    if (byUser && byUser.id !== d.id) {
      await prisma.driver.update({
        where: { id: byUser.id },
        data: {
          supplierId,
          truckId: d.truckId,
          licenseNumber: d.license,
          status: 'active',
          isOnline: d.online,
          latitude: d.lat,
          longitude: d.lng,
          performanceScore: new Decimal(4.5),
        },
      });
    } else {
      await prisma.driver.upsert({
        where: { id: d.id },
        create: {
          id: d.id,
          tenantId: TENANT_ID,
          userId: user.id,
          supplierId,
          truckId: d.truckId,
          licenseNumber: d.license,
          status: 'active',
          isOnline: d.online,
          latitude: d.lat,
          longitude: d.lng,
          performanceScore: new Decimal(4.5),
        },
        update: {
          supplierId,
          truckId: d.truckId,
          licenseNumber: d.license,
          status: 'active',
          isOnline: d.online,
          latitude: d.lat,
          longitude: d.lng,
        },
      });
    }

    console.log(
      `  driver ${d.nameEn}: ${d.phone} → ${supplierLabel.get(supplierId)} (${d.online ? 'online' : 'offline'})`,
    );
  }

  return drivers;
}

async function seedCustomers() {
  const addressIds: Record<string, string> = {};

  for (const c of CUSTOMERS) {
    const user = await upsertUser({
      phone: c.phone,
      role: 'customer',
      nameAr: c.nameAr,
      nameEn: c.nameEn,
    });

    const existing = await prisma.address.findFirst({
      where: { userId: user.id, label: c.label },
    });

    let addressId: string;
    if (existing) {
      const updated = await prisma.address.update({
        where: { id: existing.id },
        data: {
          buildingNumber: c.building,
          street: c.street,
          cityId: CITY_ID,
          latitude: c.lat,
          longitude: c.lng,
          isDefault: true,
        },
      });
      addressId = updated.id;
    } else {
      const created = await prisma.address.create({
        data: {
          id: `${c.id}-addr`,
          userId: user.id,
          label: c.label,
          buildingNumber: c.building,
          street: c.street,
          cityId: CITY_ID,
          latitude: c.lat,
          longitude: c.lng,
          isDefault: true,
        },
      });
      addressId = created.id;
    }

    addressIds[c.phone] = addressId;
    console.log(`  customer ${c.nameEn}: ${c.phone}`);
  }

  return addressIds;
}

async function seedSampleOrders(addressIds: Record<string, string>) {
  const tank = await prisma.tankSize.findUniqueOrThrow({
    where: { id: 'tank-12000' },
  });
  const supplier1 = await prisma.supplier.findFirst({
    where: {
      tenantId: TENANT_ID,
      OR: [{ id: 'pilot-supplier-alnour' }, { user: { phone: PILOT_PHONES.supplier1 } }],
    },
  });
  const customer = await prisma.user.findUnique({
    where: {
      tenantId_phone: { tenantId: TENANT_ID, phone: PILOT_PHONES.customerE2e },
    },
  });
  if (!supplier1 || !customer) {
    console.warn('Skipping sample orders — supplier/customer missing');
    return;
  }

  const addressId = addressIds[PILOT_PHONES.customerE2e];
  if (!addressId) return;

  const samples: Array<{
    id: string;
    orderNumber: string;
    status: 'supplier_review' | 'pending';
    notes: string;
    paymentType: 'cash' | 'card';
  }> = [
    {
      id: 'pilot-order-pending-01',
      orderNumber: 'PILOT-0001',
      status: 'supplier_review',
      notes: 'Pilot dry-run: awaiting supplier accept',
      paymentType: 'cash',
    },
    {
      id: 'pilot-order-pending-02',
      orderNumber: 'PILOT-0002',
      status: 'supplier_review',
      notes: 'Pilot dry-run: card sandbox path',
      paymentType: 'card',
    },
  ];

  for (const o of samples) {
    const subtotal = new Decimal(180);
    const vatAmount = subtotal.mul(new Decimal('0.15'));
    const totalAmount = subtotal.add(vatAmount);
    const data: Prisma.OrderCreateInput = {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentType: o.paymentType,
      subtotal,
      vatAmount,
      totalAmount,
      slaType: 'standard',
      notes: o.notes,
      tenant: { connect: { id: TENANT_ID } },
      customer: { connect: { id: customer.id } },
      supplier: { connect: { id: supplier1.id } },
      address: { connect: { id: addressId } },
      tankSize: { connect: { id: tank.id } },
      statusHistory: {
        create: {
          status: o.status,
          actorId: customer.id,
          notes: 'pilot seed',
        },
      },
    };

    const existing = await prisma.order.findUnique({ where: { id: o.id } });
    if (existing) {
      await prisma.order.update({
        where: { id: o.id },
        data: {
          status: o.status,
          paymentType: o.paymentType,
          notes: o.notes,
          supplierId: supplier1.id,
          addressId,
          tankSizeId: tank.id,
          subtotal,
          vatAmount,
          totalAmount,
        },
      });
    } else {
      // Unique on tenantId+orderNumber — clear soft collisions from prior runs
      const clash = await prisma.order.findFirst({
        where: { tenantId: TENANT_ID, orderNumber: o.orderNumber },
      });
      if (clash && clash.id !== o.id) {
        await prisma.order.update({
          where: { id: clash.id },
          data: { orderNumber: `${o.orderNumber}-OLD-${clash.id.slice(0, 8)}` },
        });
      }
      await prisma.order.create({ data });
    }
    console.log(`  order ${o.orderNumber}: ${o.status} (${o.paymentType})`);
  }
}

async function main() {
  console.log('Seeding Phase 1 pilot pack...');
  console.log(`DATABASE_URL host hint: ${(process.env.DATABASE_URL || '').replace(/:[^:@/]+@/, ':***@')}`);

  await ensureCatalog();
  console.log('Catalog / tenant ready');

  await upsertUser({
    phone: PILOT_PHONES.admin,
    role: 'admin',
    nameAr: 'مدير النظام',
    nameEn: 'Admin User',
    email: 'admin@pilot.suqya.sa',
  });
  console.log(`Admin: ${PILOT_PHONES.admin}`);

  console.log('Suppliers (2):');
  await seedSuppliers();

  console.log('Drivers (10) + trucks:');
  await seedDriversAndTrucks();

  console.log('Customers (5):');
  const addressIds = await seedCustomers();

  console.log('Sample orders (2):');
  await seedSampleOrders(addressIds);

  console.log('');
  console.log('Pilot seed completed.');
  console.log(`Tenant: ${TENANT_ID}`);
  console.log('Sandbox OTP: 123456 (OTP_MODE=sandbox)');
  console.log('E2E phones preserved: supplier +966502345678 / driver +966503456789 / customer +966504567890');
  console.log('See docs/testing/pilot-ops.md for dry-run checklist.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
