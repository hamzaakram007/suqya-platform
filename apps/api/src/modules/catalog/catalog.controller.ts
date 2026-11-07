import { Controller, Get, Headers, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.module';
import { Locale } from '../../common/decorators/locale.decorator';
import { AppLocale } from '../../common/locale/locale.types';
import { localizeName } from '../../common/locale/locale.util';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateLanguageDto {
  @ApiProperty({ enum: ['ar', 'en'] })
  @IsString()
  @IsIn(['ar', 'en'])
  preferredLanguage!: 'ar' | 'en';
}

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private prisma: PrismaService) {}

  @Get('tank-sizes')
  @ApiOperation({ summary: 'List available tank sizes' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  @ApiHeader({ name: 'Accept-Language', required: false })
  async tankSizes(
    @Headers('x-tenant-id') tenantId: string,
    @Locale() locale: AppLocale,
  ) {
    const rows = await this.prisma.tankSize.findMany({
      where: { tenantId, isActive: true },
      orderBy: { capacityLiters: 'asc' },
    });
    return rows.map((r) => localizeName(r, locale));
  }

  @Get('water-types')
  @ApiOperation({ summary: 'List water types' })
  @ApiHeader({ name: 'Accept-Language', required: false })
  async waterTypes(@Locale() locale: AppLocale) {
    const rows = await this.prisma.waterType.findMany();
    return rows.map((r) => localizeName(r, locale));
  }

  @Get('cities')
  @ApiOperation({ summary: 'List cities' })
  @ApiHeader({ name: 'Accept-Language', required: false })
  async cities(@Locale() locale: AppLocale) {
    const rows = await this.prisma.city.findMany({
      include: { districts: true },
      orderBy: locale === 'en' ? { nameEn: 'asc' } : { nameAr: 'asc' },
    });
    return rows.map((city) => ({
      ...localizeName(city, locale),
      districts: city.districts.map((d) => localizeName(d, locale)),
    }));
  }
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserLocaleController {
  constructor(private prisma: PrismaService) {}

  @Patch('me/language')
  @ApiOperation({ summary: 'Update preferred language (instant client switch)' })
  async updateLanguage(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLanguageDto,
  ) {
    await this.prisma.userProfile.upsert({
      where: { userId: user.sub },
      create: {
        userId: user.sub,
        preferredLanguage: dto.preferredLanguage,
      },
      update: { preferredLanguage: dto.preferredLanguage },
    });
    return { preferredLanguage: dto.preferredLanguage };
  }
}
