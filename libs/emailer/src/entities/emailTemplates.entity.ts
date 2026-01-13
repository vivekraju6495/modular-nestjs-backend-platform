import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Generated,
  DeleteDateColumn,
} from 'typeorm';

export enum TemplateVersion {
  DRAFTS = 'draft',
  PUBLISHED = 'published',
}

export enum TemplateType {
  DEFAULT = 'default', // default template created by admin
  USER = 'user',       // user created template
}

@Entity({ name: 'lib_emailer_email_templates' })
export class EmailTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'bigint', nullable: true, name: 'user_id' })
  user_id: number | null;

  @Column({ type: 'bigint', nullable: true, name: 'company_id' })
  companyId: number | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  model: any;

  @Column({ type: 'text', nullable: true })
  html: string | null;

  @Column({ type: 'json', nullable: true })
  layout: any | null;

  @Column({ type: 'enum', enum: TemplateVersion, nullable: true})
  version: TemplateVersion;

  @Column({ type: 'boolean', default: false })
  is_published: boolean;

  @Column({ type: 'text', nullable: true })
  thumbnail_url: string | null;

  @Column({ type: 'enum', enum: TemplateType, default: TemplateType.DEFAULT, comment: 'default template created by admin, user- user created template' })
  type: TemplateType;

  @Column({ type: 'boolean', default: true })
  status: boolean;
  
  @Column({ type: 'int', nullable: true })
  created_by: number | null;

  @Column({ type: 'int', nullable: true })
  updated_by: number | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
