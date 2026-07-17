import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'goods_categories' })
export class GoodsCategory extends BaseAppEntity {
  @Index({ unique: true })
  @Column({ length: 80 })
  code!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ type: 'varchar', nullable: true, length: 160 })
  localName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  icon?: string | null;

  @Index()
  @Column({ default: true })
  active!: boolean;
}

@Entity({ name: 'goods' })
export class Good extends BaseAppEntity {
  @Index({ unique: true })
  @Column({ length: 80 })
  code!: string;

  @Index()
  @Column({ length: 160 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', nullable: true, length: 160 })
  localName?: string | null;

  @Index()
  @Column({ length: 80 })
  categoryCode!: string;

  @Column({ default: 'kg' })
  defaultUnit!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string | null;

  @Index()
  @Column({ default: true })
  active!: boolean;
}
