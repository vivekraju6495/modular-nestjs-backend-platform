import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Observable, catchError, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();

    const logBase = {
      method: req.method,
      url: req.originalUrl,
      request: req.body,
    };

    return next.handle().pipe(
      tap((response) => {
        this.logger.log({
          ...logBase,
          statusCode: 200, // success
          response,
        });
      }),
      catchError((error) => {
        // Determine proper status code
        const statusCode =
          typeof error.getStatus === 'function' ? error.getStatus() : 500;

        this.logger.log({
          ...logBase,
          statusCode,
          error, // pass full error object
        });

        throw error;
      }),
    );
  }
}
