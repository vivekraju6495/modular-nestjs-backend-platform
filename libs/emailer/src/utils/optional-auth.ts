export let OptionalJwtAuthGuard: any;

try {
  OptionalJwtAuthGuard =
    require('@app/auth/guards/optional-jwt-auth.guard').OptionalJwtAuthGuard;
} catch {
  class DummyGuard {
    canActivate() {
      return true;
    }
  }
  OptionalJwtAuthGuard = DummyGuard;
}