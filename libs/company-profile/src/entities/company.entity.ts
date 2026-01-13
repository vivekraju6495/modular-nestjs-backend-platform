import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  Generated,
} from 'typeorm';

@Entity({ name: 'lib_companies' })
export class Company {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string

    @Column({ name: "user_id", type:'bigint',nullable:true})
    userId: number | null;

    @Column({ length: 255 })
    company_Name: string; // mandatory

    @Column({ type: 'text', nullable: true })
    about?: string;

    @Column({unique: true, nullable: true })
    registrationNumber?: string;

    @Column({ length: 255, nullable: true })
    industry?: string;

    @Column({ length: 255, nullable: true })
    address1?: string;

    @Column({ length: 255, nullable: true })
    address2?: string;

    @Column({ length: 100, nullable: true })
    city?: string;

    @Column({ length: 100, nullable: true })
    state?: string;

    @Column({ length: 20, nullable: true })
    zipCode?: string;

    @Column({ length: 100, nullable: true })
    country?: string;

    @Column({ length: 100, nullable: true })
    email?: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({ length: 255, nullable: true })
    companyLogo?: string;

    @Column({ default: true })
    status: boolean;

    @Column({ name: 'created_by', type: 'bigint', nullable: true })
    createdBy: number | null;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ name: 'updated_by', type: 'bigint', nullable: true })
    updatedBy: number | null;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date | null;

}
