import { Module } from '@nestjs/common';
import { TachesService } from './taches.service';
import { TachesController } from './taches.controller';

@Module({
  controllers: [TachesController],
  providers: [TachesService],
})
export class TachesModule {}
