import { Module } from '@nestjs/common';
import { ModelesEmailService } from './modeles-email.service';
import { ModelesEmailController } from './modeles-email.controller';

@Module({
  controllers: [ModelesEmailController],
  providers: [ModelesEmailService],
})
export class ModelesEmailModule {}
