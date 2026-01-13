import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { sanitize } from './utils/sanitizer';
import { LogSchema } from './logger.schema';

@Injectable()
export class LoggerService {
  private connection: mongoose.Connection | null = null;
  private enabled = process.env.ENABLE_API_LOGGING === 'true';
  private retentionDays = Number(process.env.LOG_DELETION_DAYS) || 365; // default 30 days retention

  constructor() {
    try {
      if (this.enabled && process.env.MONGODB_URI) {
        // Create a dedicated MongoDB connection for logging
        this.connection = mongoose.createConnection(process.env.MONGODB_URI);

        // Schedule a daily cleanup at midnight (safety net)
        this.scheduleDailyCleanup();
      }
    } catch (err) {
      console.warn('Logger: MongoDB not configured. Logging disabled.', err);
      this.enabled = false;
    }
  }

  /**
   * Flatten nested error messages into a readable string.
   */
  async flattenErrorMessage(err: any): Promise<string> {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (Array.isArray(err)) {
      return (await Promise.all(err.map(e => this.flattenErrorMessage(e)))).join(', ');
    }
    if (typeof err === 'object') {
      if ('message' in err) return this.flattenErrorMessage(err.message);
      return (await Promise.all(Object.values(err).map(e => this.flattenErrorMessage(e)))).join(', ');
    }
    return String(err);
  }

  /**
   * Truncate large nested objects for logging to avoid bloated logs.
   */
  async truncateObject(obj: any, depth = 2, maxArray = 5): Promise<any> {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    if (depth <= 0) return Array.isArray(obj) ? `[Array(${obj.length})]` : '[Object]';

    if (Array.isArray(obj)) {
      return [
        ...obj.slice(0, maxArray).map(item => this.truncateObject(item, depth - 1, maxArray)),
        ...(obj.length > maxArray ? [`...${obj.length - maxArray} more items`] : [])
      ];
    }

    const truncated: any = {};
    for (const key of Object.keys(obj)) {
      truncated[key] = await this.truncateObject(obj[key], depth - 1, maxArray);
    }
    return truncated;
  }

  /**
   * Log API requests, responses, and errors.
   * After saving the log, cleanupOldLogs() is triggered asynchronously.
   */
  async log(data: any) {
    if (!this.enabled || !this.connection) return;

    try {
      // Sanitize request and response objects
      const sanitized: any = {
        ...data,
        request: sanitize(data.request),
        response: sanitize(data.response),
        timestamp: new Date(),
      };

      // Process errors to keep message, error, statusCode
      if (data.error) {
        let errorObj: any = {};

        if (data.error instanceof Error) {
          // JS/Nest Error
          errorObj.name = data.error.name;
          errorObj.stack = data.error.stack;

          // If NestJS HttpException
          if ('getStatus' in data.error && typeof data.error.getStatus === 'function') {
            const response = data.error.getResponse();

            if (typeof response === 'object') {
              // For object response (like ValidationPipe)
              errorObj.message = Array.isArray(response.message)
                ? response.message.join(', ')
                : response.message ?? response.error ?? 'Error';
              errorObj.error = response.error ?? data.error.name;
              errorObj.statusCode = response.statusCode ?? data.error.getStatus();
              errorObj.details = await this.truncateObject(response);
            } else if (typeof response === 'string') {
              // String response
              errorObj.message = response;
              errorObj.error = data.error.name;
              errorObj.statusCode = data.error.getStatus();
            }
          } else {
            // Plain JS Error
            errorObj.message = data.error.message;
            errorObj.error = data.error.name;
            errorObj.statusCode = 500;
          }
        } else if (typeof data.error === 'object') {
          // Plain object errors
          errorObj.message = Array.isArray(data.error.message)
            ? data.error.message.join(', ')
            : data.error.message ?? 'Error';
          errorObj.error = data.error.error ?? 'Error';
          errorObj.statusCode = data.error.statusCode ?? 500;
          errorObj.details = await this.truncateObject(data.error);
        } else {
          // String or unknown
          errorObj.message = String(data.error);
          errorObj.error = 'Error';
          errorObj.statusCode = 500;
        }

        sanitized.error = errorObj;
        sanitized.statusCode = errorObj.statusCode;
      }

      // Collection name per day: log_YYYY-MM-DD
      const date = new Date().toISOString().split('T')[0];
      const collectionName = `log_${date}`;

      let LogModel: mongoose.Model<any>;
      try {
        LogModel = this.connection.model(collectionName);
      } catch {
        LogModel = this.connection.model(collectionName, LogSchema, collectionName);
      }

      // Save the sanitized log
      await new LogModel(sanitized).save();

      // Trigger cleanup asynchronously (non-blocking)
      this.cleanupOldLogs().catch(err => console.warn('Logger cleanup failed', err));

    } catch (err) {
      console.warn('Logger: Failed to save log. Skipping.', err);
    }
  }

  /**
   * Schedule daily cleanup at midnight as a safety net
   */
  private scheduleDailyCleanup() {
    if (!this.connection) return;

    const now = new Date();
    const millisTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

    setTimeout(() => {
      this.cleanupOldLogs();
      setInterval(() => this.cleanupOldLogs(), 24 * 60 * 60 * 1000); // every 24 hours
    }, millisTillMidnight);
  }

  /**
   * Cleanup old log collections older than retentionDays.
   * Optimized: only inspects collection names, does not fetch documents.
   */

  async cleanupOldLogs() {
    if (!this.connection || !this.connection.db) return; // safety check

    try {
      const collections = await this.connection.db.listCollections().toArray();
      const now = new Date();

      // Filter only log collections older than retention period
      const oldCollections = collections
        .filter(coll => coll.name.startsWith('log_'))
        .filter(coll => {
          const datePart = coll.name.replace('log_', '');
          const collDate = new Date(datePart);
          if (isNaN(collDate.getTime())) return false; // invalid date
          const age = (now.getTime() - collDate.getTime()) / (1000 * 60 * 60 * 24);
          return age > this.retentionDays;
        });

      // Drop all old collections in parallel
      await Promise.allSettled(
        oldCollections.map(coll => 
          this.connection!.dropCollection(coll.name)
            .then(() => console.log(`Dropped old log collection: ${coll.name}`))
            .catch(err => console.warn(`Failed to drop collection ${coll.name}`, err))
        )
      );

    } catch (err) {
      console.warn('Logger cleanup failed', err);
    }
  }


  // async cleanupOldLogs() {
  //   if (!this.connection || !this.connection.db) return; // check both

  //   try {
  //     const collections = await this.connection.db.listCollections().toArray();
  //     const now = new Date();

  //     for (const coll of collections) {
  //       const name = coll.name;
  //       if (name.startsWith('log_')) {
  //         const datePart = name.replace('log_', '');
  //         const collDate = new Date(datePart);
  //         const age = (now.getTime() - collDate.getTime()) / (1000 * 60 * 60 * 24);

  //         if (age > this.retentionDays) {
  //           await this.connection.dropCollection(name);
  //           console.log(`Dropped old log collection: ${name}`);
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.warn('Logger cleanup failed', err);
  //   }
  // }


  //health check up function

  // Return if MongoDB connection is ready


  getConnectionStatus(): boolean {
    return !!(this.connection && this.connection.readyState === 1);
  }

  // Return current retention days
  getRetentionDays(): number {
    return this.retentionDays;
  }

  // Return list of current log collections
  async getLogCollections(): Promise<string[]> {
    if (!this.connection || !this.connection.db) return [];
    const collections = await this.connection.db.listCollections().toArray();
    return collections
      .filter(c => c.name.startsWith('log_'))
      .map(c => c.name);
  }


}
