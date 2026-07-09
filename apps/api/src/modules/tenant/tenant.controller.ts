import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.module';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private prisma: PrismaService) {}

  @Get('public')
  @ApiOperation({ summary: 'List public marketplace tenants' })
  list() {
    return this.prisma.tenant.findMany({
      where: { status: 'active', mode: 'marketplace' },
      select: { id: true, name: true, nameAr: true, mode: true },
    });
  }
}
