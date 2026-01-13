import { Test, TestingModule } from '@nestjs/testing';
import { AuthRolesController } from './auth-roles.controller';

describe('AuthRolesController', () => {
  let controller: AuthRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthRolesController],
    }).compile();

    controller = module.get<AuthRolesController>(AuthRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
