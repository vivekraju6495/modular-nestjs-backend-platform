import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Generated, DeleteDateColumn } from 'typeorm';


@Entity('lib_auth_users_temperory')
export class UserTemperory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @Column({ name: 'first_name', nullable: true })
    firstName: string;

    @Column({ name: 'middle_name', nullable: true })
    middleName: string;
    
    @Column({ name: 'last_name', nullable: true })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'phone', nullable: true, unique: true })
    phone: string;

    @Column({ name: 'whatsapp', nullable: true, unique: true })
    whatsapp: string;

    @Column({ nullable: true })
    password: string;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: "verified_at",type: 'timestamp', nullable: true })
    verifiedAt: Date | null;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
    updated_at: Date;

    
}