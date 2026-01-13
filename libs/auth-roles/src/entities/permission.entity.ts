import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('lib_auth_roles_permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true,nullable: true })
  action: string; // e.g., create, update, view, delete

  // New columns
  @Column({ type: 'varchar', length: 150,nullable: true })
  code: string; // e.g., USER_CREATE, USER_VIEW

  @Column({ type: 'text', nullable: true })
  key: string; // comma-separated API endpoints or JSON

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  status: boolean; // true = active, false = inactive

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[];
}
