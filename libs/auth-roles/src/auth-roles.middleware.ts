import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthRolesService } from './auth-roles.service';
import { AuthService } from '@app/auth/auth.service';
import * as micromatch from 'micromatch';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthRolesMiddleware implements NestMiddleware {
  constructor(
    private readonly authRolesService: AuthRolesService,
    private readonly authService: AuthService,
  ) {}

  async use(req: any, res: any, next: () => void) {
    console.log('Enter AuthRolesMiddleware');

    if (!this.authRolesService) return next();

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      console.log('No token found — skipping auth check');
      return next();
    }

    let userUuid: string | null = null;
    try {
      userUuid = this.authRolesService.extractUserUuidFromToken(token);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          statusCode: 401,
          status: false,
          isAccessTokenExpired: true,
          isRefreshTokenExpired: false,
          message: 'Access token expired. Please refresh your session.',
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          statusCode: 401,
          status: false,
          isAccessTokenExpired: true,
          isRefreshTokenExpired: true,
          message: 'Invalid token. Please log in again.',
        });
      }
      return res.status(401).json({
        statusCode: 401,
        status: false,
        isAccessTokenExpired: true,
        isRefreshTokenExpired: true,
        message: 'Token verification failed.',
      });
    }

    if (!userUuid) {
      return res.status(401).json({ statusCode: 401,status:false, message: 'Invalid token payload' });
    }

    const user = await this.authService.findByUuid(userUuid);
    if (!user) return res.status(401).json({ statusCode: 401,status:false,message: 'User not found' });

    const permissions = await this.authRolesService.getUserPermissions(user.id);
    if (permissions.length === 0) {
      console.warn(`User ${user.id} has no permissions — bypassing checks`);
      return next();
    }

    const hasAllPermission = permissions.some((perm) => perm.code === 'ALL');
    if (hasAllPermission) return next();

    const hasAllKeyPermission = permissions.some((perm) => perm.key === 'ALL');
    if (hasAllKeyPermission) return next();

    const requestPath = req.baseUrl + (req.route?.path || req.originalUrl);
    const requestMethod = req.method.toUpperCase();

    const isAllowed = permissions.some((perm) => {
      const methodMatch =
        perm.method === '*' || perm.method?.toUpperCase() === requestMethod;
      const pathMatch = micromatch.isMatch(requestPath, perm.key);
      return methodMatch && pathMatch && perm.status === true;
    });

    if (!isAllowed) {
      return res.status(403).json({ statusCode: 403,status:false,message: 'Permission denied' });
    }

    next();
  }
}
