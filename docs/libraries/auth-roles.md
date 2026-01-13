
# Auth-Roles Library (@app/auth-roles)

## 1. Overview
`@app/auth-roles` manages user roles and permissions.  
It provides standardized authorization via database-driven role-permission mapping and middleware enforcement.  
Depends on `@app/auth` for JWT validation.

## 2. Purpose
- Centralize role & permission management  
- Middleware-based permission validation  
- Easy integration with modules needing role/permission control  
- Configurable public/skipped routes

## 3. Core Features
- Role Management: Create/manage roles (Admin, User, Super Admin)  
- Permission Management: Granular API action permissions  
- Role-Permission Mapping: Dynamic linking of roles & permissions  
- User-Role Mapping: Assign roles to users  
- API-Level Permission Middleware: Validates requests, skips excluded routes  
- Default Role Assignment: Assigns role to new verified users

## 4. Dependencies
- `@app/auth` for authentication & JWT  
- NestJS core modules (`@nestjs/common`, `@nestjs/core`)

## 5. Database Tables

### 5.1 lib_auth_roles_permissions
Stores system permissions (API actions).  
Columns: `id`, `action`, `code`, `key`, `description`, `status`, `created_at`, `updated_at`  
Constraints: `action` unique, primary key `id`  
Special: `key = 'ALL'` bypasses permission checks

### 5.2 lib_auth_roles_default_roles
Predefined roles.  
Columns: `id`, `name`  
Default: Admin, User, Super Admin  

### 5.3 lib_auth_roles_map_permissions
Maps roles → permissions.  
Columns: `id`, `userId`, `roleId`, `permissionId`, `created_at`, `updated_at`  
Foreign keys: role & permission references, cascade delete  

### 5.4 lib_auth_roles_map_user_roles
Maps users → roles.  
Columns: `id`, `userId`, `roleId`  
Foreign key: role reference

## 6. Middleware: AuthRolesMiddleware
- Intercepts requests → validates permissions  
- Uses `OptionalJwtAuthGuard` from `@app/auth`  
- Skips routes marked as `ALL` or excluded  

Example in `app.module.ts`:
```ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthRolesMiddleware)
      .exclude(
        { path: 'auth/register', method: RequestMethod.ALL },
        { path: 'auth/login', method: RequestMethod.ALL },
        { path: 'auth-roles/assign-user', method: RequestMethod.ALL },
        { path: 'auth-roles/permission/create', method: RequestMethod.ALL }
      )
      .forRoutes('*');
  }
}
```

## 7. API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /auth-roles/roles/create | POST | Create a new role |
| /auth-roles/permission/create | POST | Create a new permission |
| /auth-roles/assign-user | POST | Assign role to user (JWT optional) |
| /auth-roles/assign-permission | POST | Assign permission to role (JWT optional) |

Guards: `OptionalJwtAuthGuard` from `@app/auth`

## 8. Flow Summary
1. User registers via `@app/auth`  
2. Default role assigned after verification  
3. Each API request passes through `AuthRolesMiddleware`  
4. Middleware extracts token → fetches roles → checks permissions → skips if excluded or ALL

## 9. Security Considerations
- Verify token before checking permissions  
- Restrict ALL permissions to truly public routes  
- Cascade deletes ensure cleanup  
- Use migrations for role/permission updates

## 10. Future Enhancements
- Permission caching via Redis  
- CLI to auto-register permissions from metadata  
- Hierarchical roles (Super Admin inherits Admin)  
- Audit logging for permission changes
