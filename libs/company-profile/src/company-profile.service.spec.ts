import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfileService } from './company-profile.service';

describe('CompanyProfileService', () => {
  let service: CompanyProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyProfileService],
    }).compile();

    service = module.get<CompanyProfileService>(CompanyProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
