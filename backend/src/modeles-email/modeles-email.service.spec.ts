import { Test, TestingModule } from '@nestjs/testing';
import { ModelesEmailService } from './modeles-email.service';

describe('ModelesEmailService', () => {
  let service: ModelesEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelesEmailService],
    }).compile();

    service = module.get<ModelesEmailService>(ModelesEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
