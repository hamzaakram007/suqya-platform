import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ErpService {
  constructor(private prisma: PrismaService) {}

  async recordFuelExpense(
    tenantId: string,
    supplierId: string,
    data: { truckId?: string; liters: number; cost: number; odometer?: number },
  ) {
    return this.prisma.fuelExpense.create({
      data: {
        tenantId,
        supplierId,
        truckId: data.truckId,
        liters: new Decimal(data.liters),
        cost: new Decimal(data.cost),
        odometer: data.odometer,
      },
    });
  }

  async listInventory(tenantId: string, supplierId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { tenantId, supplierId },
      orderBy: { name: 'asc' },
    });
  }

  async upsertInventoryItem(
    tenantId: string,
    supplierId: string,
    data: { name: string; sku: string; quantity: number; unit: string },
  ) {
    return this.prisma.inventoryItem.upsert({
      where: { tenantId_supplierId_sku: { tenantId, supplierId, sku: data.sku } },
      create: { tenantId, supplierId, ...data },
      update: { quantity: data.quantity, name: data.name, unit: data.unit },
    });
  }

  async listEmployees(tenantId: string, supplierId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, supplierId },
      orderBy: { name: 'asc' },
    });
  }

  async createEmployee(
    tenantId: string,
    supplierId: string,
    data: { name: string; role: string; phone?: string; nationalId?: string },
  ) {
    return this.prisma.employee.create({
      data: { tenantId, supplierId, ...data },
    });
  }
}
