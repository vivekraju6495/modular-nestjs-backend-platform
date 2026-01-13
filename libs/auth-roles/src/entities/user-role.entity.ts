// user-role.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Role } from './role.entity';

@Entity('lib_auth_roles_map_user_roles')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, (role) => role.userRoles)
  role: Role;

  @Column()
  userId: number; // comes from auth user table
}
