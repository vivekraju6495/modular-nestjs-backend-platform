import { AuthRolesMiddleware } from './auth-roles.middleware';
import { AuthRolesService } from './auth-roles.service';

describe('AuthRolesMiddleware', () => {
  let middleware: AuthRolesMiddleware;
  let mockAuthRolesService: Partial<AuthRolesService>;

  beforeEach(() => {
    mockAuthRolesService = {
      extractUserUuidFromToken: jest.fn().mockReturnValue('test-uuid'),
      getUserPermissions: jest.fn().mockResolvedValue(['view']),
    };

    middleware = new AuthRolesMiddleware(
      mockAuthRolesService as AuthRolesService,
      undefined, //fix: pass undefined not null
    );
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
});
