import { Test, TestingModule } from '@nestjs/testing';
import { ModelesEmailController } from './modeles-email.controller';
import { ModelesEmailService } from './modeles-email.service';

describe('ModelesEmailController', () => {
  let controller: ModelesEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModelesEmailController],
      providers: [ModelesEmailService],
    }).compile();

    controller = module.get<ModelesEmailController>(ModelesEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
