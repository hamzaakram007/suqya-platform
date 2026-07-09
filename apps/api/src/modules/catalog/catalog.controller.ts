import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.module';
import { Headers } from '@nestjs/common';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private prisma: PrismaService) {}

  @Get('tank-sizes')
  @ApiOperation({ summary: 'List available tank sizes' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  tankSizes(@Headers('x-tenant-id') tenantId: string) {
    return this.prisma.tankSize.findMany({
      where: { tenantId, isActive: true },
      orderBy: { capacityLiters: 'asc' },
    });
  }

  @Get('water-types')
  @ApiOperation({ summary: 'List water types' })
  waterTypes() {
    return this.prisma.waterType.findMany();
  }

  @Get('cities')
  @ApiOperation({ summary: 'List cities' })
  cities() {
    return this.prisma.city.findMany({
      include: { districts: true },
      orderBy: { nameAr: 'asc' },
    });
  }
}
