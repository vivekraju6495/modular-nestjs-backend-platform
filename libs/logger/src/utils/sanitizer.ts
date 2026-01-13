export function sanitize(data: any): any {
  const clone = { ...data };
  const sensitiveFields = ['password', 'ssn', 'token', 'authorization'];

  for (const field of sensitiveFields) {
    if (clone[field]) clone[field] = '[REDACTED]';
  }

  return clone;
}
