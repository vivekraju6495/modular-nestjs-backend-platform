import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Generated,
  DeleteDateColumn,
} from 'typeorm';
import { EmailElementsGroup } from './emailElementsGroup.entity';

@Entity('lib_emailer_email_elements')
export class EmailElement {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  // uuid: string;
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @ManyToOne(() => EmailElementsGroup, (group) => group.elements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: EmailElementsGroup;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text' })
  block: string;

  @Column({ type: 'json', nullable: true })
  attributes: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'text', nullable: true })
  thumbnail: string | null;

  @Column({ type: 'bigint', nullable: true, name: 'user_id' })
  userId: number | null;

  @Column({ type: 'bigint', nullable: true, name: 'company_id' })
  companyId: number | null;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;
  
  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
  updated_at: Date;
  
  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  
}
