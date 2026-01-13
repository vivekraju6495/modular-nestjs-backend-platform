#  Logger Library

## 1. Overview
The `@app/logger` library is responsible for capturing, sanitizing, and storing API request/response logs into a MongoDB database.
It provides a centralized and configurable mechanism to trace application activity for debugging, monitoring, and auditing purposes.
Logging can be enabled or disabled using environment variables, and stored logs are automatically deleted after a specified number of days.
________________________________________

## 2. Core Features
•	Middleware-based API request and response logging.
•	Sensitive data sanitization before persistence.
•	Configurable retention period for logs.
•	MongoDB as persistent storage.
•	Environment-based logging enable/disable control.
•	Non-blocking log operations for performance efficiency.
________________________________________

## 3. Environment Variables
Variable	Description	Example
ENABLE_API_LOGGING	Enables or disables logging globally	true or false
LOG_DELETION_DAYS	Number of days after which logs are auto-deleted	5
MONGODB_URI	Connection URI for MongoDB	mongodb://127.0.0.1:27017/modular_framework
________________________________________

## 4. Installation & Setup

### Step 1: Add environment variables
In your .env file:
ENABLE_API_LOGGING=true
LOG_DELETION_DAYS=5
MONGODB_URI=mongodb://127.0.0.1:27017/modular_framework

### Step 2: Integrate into main.ts
let LoggerService: any;
try {
  ({ LoggerService } = require('@app/logger/logger.service'));
} catch (e) {
  LoggerService = null;
}

let LoggerInterceptor: any;
try {
  ({ LoggerInterceptor } = require('@app/logger/logger.interceptor'));
} catch (e) {
  LoggerInterceptor = null;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (LoggerService && LoggerService != null) {
    app.useGlobalInterceptors(new LoggerInterceptor(app.get(LoggerService)));
  }

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
________________________________________

## 5. Module Architecture

### 5.1. LoggerInterceptor
•	Acts as a global interceptor to capture all inbound and outbound HTTP requests.
•	Invokes LoggerService methods for logging request and response.
•	Ensures non-blocking I/O operations to prevent latency.

### 5.2. LoggerService
•	Responsible for saving logs into MongoDB.
•	Includes logic to:
o	Sanitize sensitive fields before saving.
o	Manage log lifecycle (auto-deletion after configured days).
•	Uses environment variables for configuration.

### 5.3. sanitize.ts
Utility function to sanitize sensitive fields like password, token, and authorization.

export function sanitize(data: any): any {
  const clone = { ...data };
  const sensitiveFields = ['password', 'ssn', 'token', 'authorization'];

  for (const field of sensitiveFields) {
    if (clone[field]) clone[field] = '[REDACTED]';
  }

  return clone;
}
________________________________________

## 6. Logging Flow

1.	Incoming Request → Interceptor Triggered
Captures HTTP method, URL, headers, and body.
2.	Data Sanitization
Applies sanitize() to redact sensitive information.
3.	Database Logging
Persists sanitized data into MongoDB (if ENABLE_API_LOGGING=true).
4.	Response Logging
Captures outgoing responses, status codes, and timestamps.
5.	Log Cleanup
Scheduled job removes logs older than LOG_DELETION_DAYS.
________________________________________

## 7. MongoDB Schema (Example)
{
  _id: ObjectId,
  method: String,
  endpoint: String,
  request: Object,
  response: Object,
  statusCode: Number,
  userId: String,
  timestamp: Date,
}
________________________________________

## 8. Error Handling
•	Any errors in logging are silently caught to avoid blocking request flow.
•	When logging is disabled, interceptor execution is skipped automatically.


## 9. Future Enhancements
•	Support for structured log export (JSONL or CSV).
•	Integration with external monitoring tools like ELK, Datadog, or Sentry.
•	Add configurable log sampling to reduce noise in high-traffic environments.
•	Introduce asynchronous bulk insert for heavy traffic APIs.

