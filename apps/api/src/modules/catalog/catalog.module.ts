import { Module } from '@nestjs/common';
import { CatalogController, UserLocaleController } from './catalog.controller';

@Module({
  controllers: [CatalogController, UserLocaleController],
})
export class CatalogModule {}
