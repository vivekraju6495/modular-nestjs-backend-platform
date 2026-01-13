import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('lib_uploader_upload_logs')
export class UploadLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true })
  fileName: string;

  @Column({nullable: true })
  fileType: string;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column({nullable: true })
  size: number;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ type: 'text', nullable: true })
  error: string | null;
}
