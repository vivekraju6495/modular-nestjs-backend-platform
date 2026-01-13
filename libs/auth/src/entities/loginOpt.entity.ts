import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm';


@Entity('lib_auth_users_otp')
export class UserOtp {

@PrimaryGeneratedColumn()
id: number;

@Column({ type: 'uuid', unique: true })
@Generated('uuid')
uuid: string;

@Column({ name: "user_id", type:'integer',nullable:false})
userId: number;

@Column({name: 'type', nullable:true})
type: string;

@Column({ type: 'varchar', length: 6, nullable: true })
otp: string | null;

@Column({ name: "expires_at",type: 'timestamp', nullable: true })
expiresAt: Date | null;

@Column({ name: "is_used", default: false })
isUsed: boolean;

@Column({ name: "used_at",type: 'timestamp', nullable: true })
usedAt: Date | null;

@Column({ name: "is_expired", default: false })
isExpired: boolean;

@CreateDateColumn({ name: 'created_at'})
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at'})
updatedAt: Date;
}