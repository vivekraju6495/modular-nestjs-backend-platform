import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthRolesService } from './auth-roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { OptionalJwtAuthGuard } from './utils/optional-auth';

@Controller('auth-roles')
export class AuthRolesController {
    constructor(private readonly authRolesService: AuthRolesService) {}

    @Get()
    getHello() {
        return { message: 'Welcome to Auth roles Library!' };
    }
    // 1. Create Role
    @Post('roles/create')
    async createRole(@Body() dto: CreateRoleDto) {
        return this.authRolesService.createRole(dto?.name);
    }

    // 2. Create Permission
    @Post('permission/create')
    async createPermission(@Body() dto: CreatePermissionDto) {
        return this.authRolesService.createPermission(dto?.action, dto?.code, dto?.description,dto?.key);
    }

    // 3. Assign Role to User
    @UseGuards(OptionalJwtAuthGuard)
    @Post('assign-user')
    async assignRoleToUser(@Body() dto: AssignRoleDto,@Request() req: any ) {
         console.log("Req of  ::",req.user);
        let userId = req.user?.userId || null;
        if(!userId){
            userId = dto?.userId;
        }
        return this.authRolesService.assignRoleToUser(dto?.roleId,userId);
    }

    // 4. Assign Permission to Role
    @UseGuards(OptionalJwtAuthGuard)
    @Post('assign-permission')
    async assignPermissionToRole(@Body() dto: AssignPermissionDto, @Request() req: any ) {
       
        let userId = req.user?.userId || null;
        if(!userId){
            userId = dto?.userId;
        }
        return this.authRolesService.assignPermissionToRole(
        dto?.roleId,
        dto?.permissionId,
        userId
        );
    }
}
