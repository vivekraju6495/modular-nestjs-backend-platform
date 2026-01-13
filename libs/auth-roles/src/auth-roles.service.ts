import { forwardRef, HttpStatus, Inject, Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import * as jwt from 'jsonwebtoken';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
// // import { AuthService } from '@app/auth/auth.service';
// let AuthService: any;
// try {
//   ({ AuthService } = require('libs/auth/src'));
// } catch (e) {
//   AuthService = null;
// }
@Injectable()
export class AuthRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,

     @Optional()
      @Inject('AuthService')
      private readonly authService?: any,
   
  ) {}

  extractUserUuidFromToken(token: string): string | null {
    //try {
      const secret = process.env.JWT_KEY;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      const decoded: any = jwt.verify(token, secret);
      //console.log("decode : ", decoded);
      return decoded.sub || decoded.userId || decoded.uuid || null;
    // } catch {
    //   return null;
    // }
  }

async getUserPermissions(userId: number): Promise<
  { 
    key: string;
    method: string;
    code: string;
    description: string;
    status: boolean;
  }[]
> {
  // 1. Find all roles for user
  const userRoles = await this.userRoleRepo.find({
    where: { userId },
    relations: ['role'],
  });

  const roleIds = userRoles.map((ur) => ur.role.id);

  if (!roleIds.length) {
    return [];
  }

  // 2. Find permissions assigned to those roles
  const rolePermissions = await this.rolePermRepo.find({
    where: { role: { id: In(roleIds) }, userId },
    relations: ['permission'],
  });

  // 3. Return only active permissions with full details
  return rolePermissions
    .map((rp) => rp.permission)
    .filter((perm) => perm?.status === true)
    .map((perm) => ({
      key: perm.key,
      method: perm.key ?? '*', // default to * if not set
      code: perm.code,
      description: perm.description,
      status: perm.status,
    }));
}

  async getUserRolesWithPermissions(userId: number): Promise<{
    roles: {
      name: string;
      permissions: {
        key: string;
        method: string;
        code: string;
        description: string;
        status: boolean;
      }[];
    }[];
  }> {
    const userRole = await this.userRoleRepo.findOne({
      where: { userId },
      relations: ['role'],
    });
  
    if (!userRole || !userRole.role) {
      return { roles: [] };
    }

    const rolePermissions = await this.rolePermRepo.find({
      where: { role: { id: userRole.role.id }, userId },
      relations: ['permission'],
    });

    const permissions = rolePermissions
      .map((rp) => rp.permission)
      .filter((perm) => perm?.status === true)
      .map((perm) => ({
        key: perm.key,
        method: perm.key ?? '*', // corrected: use perm.method, not perm.key
        code: perm.code,
        description: perm.description,
        status: perm.status,
      }));

    return {
      roles: [
        {
          name: userRole.role.name,
          permissions,
        },
      ],
    };
  }

  // 1. Create Role
  async createRole(name: string) {
    try {
      const role = this.roleRepo.create({ name });
      const saved = await this.roleRepo.save(role);
      return {
        statusCode: HttpStatus.CREATED,
        status: true,
        message: 'Role created successfully',
        data: saved,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Failed to create role',
        error: error.message,
      };
    }
  }

  // 2. Create Permission
  async createPermission(action:string, code:string,description:string,key: string) {
    try {
      const permission = this.permissionRepo.create({ action, code, description, key});
      const saved = await this.permissionRepo.save(permission);
      return {
        statusCode: HttpStatus.CREATED,
        status: true,
        message: 'Permission created successfully',
        data: saved,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Failed to create permission',
        error: error.message,
      };
    }
  }

  // 3. Assign Role to User
  async assignRoleToUser(roleId: number, userUuid?: string) {
    try {
      // Resolve userId from userUuid if needed
       let userId: number | null = null;
      if (userUuid && this.authService) {
        const user = await this.authService.findByUuid(userUuid);
        userId = user?.id ?? null;
      }

      if (!userId) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'User ID is required',
        };
      }

      const role = await this.roleRepo.findOne({ where: { id: roleId } });
      if (!role) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Role not found',
        };
      }

      // Cast userId properly (ensures number only)
      const userRole = this.userRoleRepo.create({
        userId: userId as number,
        role,
      });

      const saved = await this.userRoleRepo.save(userRole);

      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: 'Role assigned to user successfully',
        data: saved,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Failed to assign role to user',
        error: error.message,
      };
    }
  }

  // 4. Assign Permission to Role
  async assignPermissionToRole(roleId: number, permissionId: number, userUuid: string) {
    try {
      let userId: number | null = null;
      if (userUuid && this.authService) {
        const user = await this.authService.findByUuid(userUuid);
        userId = user?.id ?? null;
      }

      const role = await this.roleRepo.findOne({ where: { id: roleId } });
      if (!role) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Role not found',
        };
      }

      const permission = await this.permissionRepo.findOne({
        where: { id: permissionId },
      });
      if (!permission) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Permission not found',
        };
      }

      const rolePermission = this.rolePermRepo.create({ role, permission,userId });
      const saved = await this.rolePermRepo.save(rolePermission);

      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: 'Permission assigned to role successfully',
        data: saved,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Failed to assign permission to role',
        error: error.message,
      };
    }
  }
  
  async mapUserRole(userId: number, defaultRole: string | number) {
    let role;
    console.log("enter in role mapping API :", userId)
    console.log("default roles data : ", defaultRole);
    if (typeof defaultRole === 'string') {
      // lookup by role name
      role = await this.roleRepo.findOne({ where: { name: defaultRole } });
    } else if (typeof defaultRole === 'number') {
      // lookup by role id
      role = await this.roleRepo.findOne({ where: { id: defaultRole } });
    }
   // console.log("roles data : ", role);
    if (!role) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        status: false,
        message: 'Role not found',
      };
    }

    // check if mapping already exists
    const existing = await this.userRoleRepo.findOne({
      where: { userId, role: { id: role.id } },
      relations: ['role'],
    });

    if (existing) {
      return {
        statusCode: HttpStatus.CONFLICT,
        status: false,
        message: 'User already has this role',
      };
    }

    const userRole = this.userRoleRepo.create({
      userId,
      role,
    });

    const saved = await this.userRoleRepo.save(userRole);
//console.log("saved data for roles : ", saved);
    // fetch all active permissions
    const permissions = await this.permissionRepo.find({
      where: { status: true },
    });

    if (!permissions || permissions.length === 0) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        status: false,
        message: 'No active permissions found',
      };
    }

    // prepare role-permission mappings
    const rolePermissions = permissions.map((perm) =>
      this.rolePermRepo.create({
        role,
        permission: perm,
        userId,
      }),
    );

    // bulk save
    await this.rolePermRepo.save(rolePermissions);
// console.log("rolePermissions data for roles : ", rolePermissions);
    return {
      statusCode: HttpStatus.CREATED,
      status: true,
      message: 'Role mapped successfully',
      data: null
    };
  }


}
