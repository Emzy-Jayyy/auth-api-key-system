import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('api_keys')
export class ApiKey extends BaseEntity {
  @Column({ unique: true })
  keyHash: string;

  @Column()
  name: string;

  @Column({ length: 20 })
  prefix: string;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @ManyToOne(() => User, (user) => user.apiKeys)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
