import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export type MedicineType = 'medicine' | 'pesticide' | 'fertilizer';

@Entity({ name: 'medicines' })
export class Medicine extends BaseAppEntity {
  @Index({ unique: true })
  @Column({ length: 100 })
  code!: string;

  @Index()
  @Column({ length: 180 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 30 })
  type!: MedicineType;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Index()
  @Column({ default: true })
  active!: boolean;
}

@Entity({ name: 'seller_inventory' })
@Index(['sellerId', 'medicineCode'], { unique: true })
export class SellerInventory extends BaseAppEntity {
  @Index()
  @Column({ type: 'uuid' })
  sellerId!: string;

  @Index()
  @Column({ length: 100 })
  medicineCode!: string;

  @Index()
  @Column({ length: 180 })
  medicineName!: string;

  @Index()
  @Column({ length: 40 })
  type!: string;

  @Column({ type: 'double precision' })
  stockQuantity!: number;

  @Column({ length: 30 })
  unit!: string;

  @Column({ type: 'double precision' })
  price!: number;

  @Column({ length: 180 })
  shopName!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'double precision' })
  latitude!: number;

  @Column({ type: 'double precision' })
  longitude!: number;

  @Index()
  @Column({ default: true })
  active!: boolean;
}
