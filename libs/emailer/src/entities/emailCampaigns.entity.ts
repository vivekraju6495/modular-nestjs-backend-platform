import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    DeleteDateColumn,
    Generated,
} from 'typeorm';
import { EmailTemplate } from './emailTemplates.entity';

export enum CampaignStatus {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    SENDING = 'sending',
    SENT = 'sent',
    PAUSED = 'paused',
}
@Entity('lib_emailer_email_campaigns')
export class EmailCampaign {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
    // uuid: string;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @Column({ type: 'bigint', nullable: true, name: 'user_id' })
    userId: number | null;

    @Column({ type: 'bigint', nullable: true, name: 'company_id' })
    companyId: number | null;

    @Column({ type:'varchar',length: 255 })
    name: string;

    @Column({ type: 'bigint' ,name: 'template_id'})
    templateId: number;

    @Column({ type:'varchar', length: 255, name: 'from_name' })
    fromName: string;

    @Column({  type:'varchar',length: 255 ,name: 'from_email' })
    fromEmail: string;

    @Column({ type:'varchar', length: 255, nullable: true ,name: 'reply_to' })
    replyTo: string;

    @Column({ type: 'text' })
    subject: string;

    @Column({
        type: 'enum',
        enum: CampaignStatus,
    })
    status: CampaignStatus;

    @Column({ type: 'timestamptz', nullable: true ,name: 'send_at' })
    sendAt: Date;

    @Column({ type: 'jsonb', nullable: false, default: () => "'[]'" })
    audience: string[];

    @Column({ type: 'jsonb', nullable: false, default: () => "'[]'" })
    emails: string[];

    @Column({ name: 'created_by', type: 'bigint', nullable: true })
    createdBy: number | null;

    @CreateDateColumn({ type: 'timestamptz',name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz',name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
    deletedAt: Date | null;

    @ManyToOne(() => EmailTemplate)
    @JoinColumn({ name: 'template_id' })
    template: EmailTemplate;

    @Column({ type: 'boolean', default: false })
    is_sent: boolean;
}



