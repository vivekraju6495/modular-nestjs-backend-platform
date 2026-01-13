import { forwardRef, Module } from '@nestjs/common';
import { AuthRolesService } from './auth-roles.service';
import { AuthRolesController } from './auth-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { AuthModule } from '@app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import authConfig from '@app/auth/config/auth.config';

@Module({
  imports: [
    forwardRef(() => AuthModule), // optional back reference
    ConfigModule.forFeature(authConfig),
    TypeOrmModule.forFeature([Role, Permission, UserRole, RolePermission])
  ],
  providers: [
    {
      provide: 'AuthRolesService',
      useExisting: AuthRolesService,
    },
    AuthRolesService,
  ],
  exports: [AuthRolesService],
  controllers: [AuthRolesController],
})
export class AuthRolesModule {}
