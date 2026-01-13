export type BulkUploadResult = {
  email: string;
  status: 'invalid' | 'inserted' | 'updated' | 'skipped - already exists';
};