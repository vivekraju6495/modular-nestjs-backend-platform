import { Test, TestingModule } from '@nestjs/testing';
import { AuthRolesService } from './auth-roles.service';

describe('AuthRolesService', () => {
  let service: AuthRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRolesService],
    }).compile();

    service = module.get<AuthRolesService>(AuthRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
