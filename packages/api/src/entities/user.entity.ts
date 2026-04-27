import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base-entity';
import { UserRole, UserStatus } from '../constants/enums';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;
}
