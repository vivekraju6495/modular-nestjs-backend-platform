import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  DeleteDateColumn,
} from 'typeorm';

export enum PermissionStatus {
  OPTED_IN = 'opted-in',
  OPTED_OUT = 'opted-out',
}

@Entity('lib_contacts')
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 150,nullable: true, name: 'first_name' })
    firstName: string;

    @Column({ type: 'varchar', length: 150,nullable: true, name: 'last_name' })
    lastName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'address1' })
    address1: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'address2' })
    address2: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    state: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    zipcode: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country: string;

    @Column({ type: 'bigint', nullable: true, name: 'country_id' })
    countryId: number | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    number: string;

    @Column({ type: 'date', nullable: true })
    birthday?: string | null;


    @Column({ type: 'varchar', length: 255, name: 'company_name', nullable: true })
    companyName: string;

    @Column({ type: 'bigint', nullable: true, name: 'user_id' })
    userId: number | null;

    @Column({ type: 'bigint', nullable: true, name: 'company_id' })
    companyId: number | null;

    @Column({ type: 'text', array: true, default: '{}' })
    tags: string[];

    @Column({
        type: 'enum',
        enum: PermissionStatus,
        default: PermissionStatus.OPTED_IN,
    })
    permission: PermissionStatus;

    @Column({ name: 'is_subscribed', type: 'boolean', default: true })
    isSubscribed: boolean;

    @Column({ type: 'boolean', default: true })
    status: boolean;
    
    @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
    created_at: Date;
      
    @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
    updated_at: Date;
      
    @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
    deletedAt: Date | null;
}
