import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('lib_contacts_countries')
export class Country {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    code: string; // e.g., "US", "IN"

    @Column({ type: 'varchar', length: 10, nullable: true, name:"phone_code" })
    phoneCode?: string; // e.g., "+1"

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
