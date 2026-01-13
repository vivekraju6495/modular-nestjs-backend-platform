import { Column, CreateDateColumn, DeleteDateColumn, Entity, Generated, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum JobStatus {
    QUEUED = 'queued',
    SENT = 'sent',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}
 
@Entity('lib_emailer_email_send_jobs')
export class EmailSendJob {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
    // uuid: string;
    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @Column({ type: 'bigint' ,name: 'campaign_id'})
    campaignId: number;

    @Column({ type: 'uuid', nullable: true })
    recipient_contact_id?: string | null;


    @Column({ type: 'varchar', length: 255 , nullable: true})
    email: string;

    @Column({
        type: 'enum',
        enum: JobStatus,
    })
    status: JobStatus;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'text', nullable: true , name: 'last_error' })
    lastError: string;

    @Column({ type: 'timestamptz', nullable: true  ,name: 'sent_at' })
    sentAt: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
    created_at: Date;
    
    @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
    updated_at: Date;
    
    @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
    deletedAt: Date | null;
}