// roles.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity('lib_auth_roles_default_roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // user, admin, super_admin

  @OneToMany(() => UserRole, (ur) => ur.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];
}
