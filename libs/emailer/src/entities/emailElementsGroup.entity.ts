import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Generated,
  DeleteDateColumn,
} from 'typeorm';
import { EmailElement } from './emailElements.entity';

@Entity('lib_emailer_email_elements_group')
export class EmailElementsGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'bigint', nullable: true, name: 'user_id' })
  userId: number | null;

  @Column({ type: 'bigint', nullable: true, name: 'company_id' })
  companyId: number | null;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => EmailElement, (element) => element.group)
  elements: EmailElement[];
  
  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;
  
  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
  updated_at: Date;
  
  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
