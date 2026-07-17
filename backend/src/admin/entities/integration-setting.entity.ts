import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'integration_settings' })
export class IntegrationSetting extends BaseAppEntity {
  @Index({ unique: true })
  @Column({ length: 80 })
  key!: string;

  @Column({ type: 'text' })
  encryptedValue!: string;

  @Column({ type: 'varchar', length: 40, default: 'json' })
  valueType!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string | null;
}
