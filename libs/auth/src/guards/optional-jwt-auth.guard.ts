import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

// @Injectable()
// export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
//   handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
//     // If token is valid, return user
//     if (user) return user;

//     // If no token or invalid → return null (instead of throwing 401)
//     return null;
//   }
// }

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) return user; // token valid → return user

    // Check for token errors
    if (info instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedException({
        statusCode: 401,
        status: false,
        isAccessTokenExpired: true,
        isRefreshTokenExpired: false,
        message: 'Access token expired. Please refresh your session.',
      });
    }

    if (info instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedException({
        statusCode: 401,
        status: false,
        isAccessTokenExpired: true,
        isRefreshTokenExpired: true,
        message: 'Invalid token. Please log in again.',
      });
    }

    if (err) {
      throw new UnauthorizedException({
        statusCode: 401,
        status: false,
        isAccessTokenExpired: true,
        isRefreshTokenExpired: true,
        message: 'Authentication failed.',
      });
    }

    // No token present → return null (optional routes)
    return null;
  }
}
