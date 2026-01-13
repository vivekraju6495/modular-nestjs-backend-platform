export function isValidFileType(mime: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/png','image/jpg', 'video/mp4','video/mov','video/3gp', 'application/pdf'];
  return allowedTypes.includes(mime);
}
