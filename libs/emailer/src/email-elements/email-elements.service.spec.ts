import { Test, TestingModule } from '@nestjs/testing';
import { EmailElementsService } from './email-elements.service';

describe('EmailElementsService', () => {
  let service: EmailElementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailElementsService],
    }).compile();

    service = module.get<EmailElementsService>(EmailElementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
