import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { MarketplaceProduct } from '../marketplace/entities/marketplace.entity';
import { User, UserType } from '../user/entities/user.entity';
import { Medicine } from './entities/medicine.entity';
import { NearbySellerFilterDto, NearbySellerQueryDto, UpdateSellerLocationDto, UpsertInventoryDto } from './dto/seller-inventory.dto';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Medicine) private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(MarketplaceProduct) private readonly productRepository: Repository<MarketplaceProduct>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async updateLocation(sellerId: string, dto: UpdateSellerLocationDto) {
    const seller = await this.userRepository.findOne({ where: { id: sellerId, role: UserType.MEDICINE_SELLER } });
    if (!seller) throw new NotFoundException('Medicine seller not found');
    seller.shopName = dto.shopName.trim();
    seller.address = dto.address.trim();
    seller.location = { latitude: dto.latitude, longitude: dto.longitude, updatedAt: new Date().toISOString() };
    await this.userRepository.save(seller);
    await this.productRepository.createQueryBuilder().update(MarketplaceProduct).set({
      latitude: dto.latitude,
      longitude: dto.longitude,
      specifications: () => `COALESCE(specifications, '{}'::jsonb) || jsonb_build_object('shopName', :shopName, 'address', :address)`,
    }).where('sellerId = :sellerId', { sellerId }).andWhere("productKind IN ('medicine','pesticide','fertilizer')").setParameters({ shopName: seller.shopName, address: seller.address }).execute();
    return { data: toApiEntity(seller) };
  }

  async upsertInventory(sellerId: string, dto: UpsertInventoryDto) {
    const catalogCode = dto.medicineCode.trim().toLowerCase();
    const [medicine, seller] = await Promise.all([
      this.medicineRepository.findOne({ where: { code: catalogCode, active: true } }),
      this.userRepository.findOne({ where: { id: sellerId, role: UserType.MEDICINE_SELLER } }),
    ]);
    if (!medicine) throw new NotFoundException('Medicine catalog item not found');
    if (!seller) throw new NotFoundException('Medicine seller not found');
    const latitude = seller.location?.latitude;
    const longitude = seller.location?.longitude;
    if (latitude == null || longitude == null || !seller.shopName || !seller.address) throw new BadRequestException('Set shop name and location first');

    let product = await this.productRepository.findOne({ where: { sellerId, catalogCode } });
    product ??= this.productRepository.create({ sellerId, catalogCode });
    Object.assign(product, {
      categoryCode: medicine.type,
      productKind: medicine.type,
      title: medicine.name,
      description: medicine.description ?? `${medicine.name} supplied by ${seller.shopName}`,
      price: dto.price,
      currency: 'BDT',
      stock: Math.max(0, Math.floor(dto.stockQuantity)),
      unit: dto.unit.trim(),
      transactionType: 'sale',
      latitude,
      longitude,
      status: dto.active === false ? 'archived' : 'published',
      restrictedProduct: medicine.type === 'medicine' || medicine.type === 'pesticide',
      specifications: { medicineCode: catalogCode, medicineType: medicine.type, shopName: seller.shopName, address: seller.address, unit: dto.unit.trim() },
      imageUrls: product.imageUrls ?? [],
    });
    const saved = await this.productRepository.save(product);
    return { data: this.toLegacyInventory(saved) };
  }

  async mine(sellerId: string) {
    const data = await this.productRepository.createQueryBuilder('product')
      .where('product.sellerId = :sellerId', { sellerId })
      .andWhere("product.productKind IN ('medicine','pesticide','fertilizer')")
      .orderBy('product.title', 'ASC').getMany();
    return { data: data.map((item) => this.toLegacyInventory(item)) };
  }

  async nearbyForUser(userId: string, query: NearbySellerFilterDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const latitude = user?.location?.latitude;
    const longitude = user?.location?.longitude;
    if (latitude == null || longitude == null) throw new BadRequestException('Location is not saved yet. Allow location access and try again.');
    return this.findNearby(latitude, longitude, query);
  }

  async nearby(query: NearbySellerQueryDto) { return this.findNearby(query.latitude, query.longitude, query); }

  private async findNearby(latitude: number, longitude: number, query: NearbySellerFilterDto) {
    const qb = this.productRepository.createQueryBuilder('product')
      .where("product.status = 'published'")
      .andWhere('product.stock > 0')
      .andWhere("product.productKind IN ('medicine','pesticide','fertilizer')")
      .andWhere('product.latitude IS NOT NULL AND product.longitude IS NOT NULL');
    if (query.medicineCode?.trim()) qb.andWhere('product.catalogCode = :catalogCode', { catalogCode: query.medicineCode.trim().toLowerCase() });
    if (query.search?.trim()) qb.andWhere("(product.title ILIKE :search OR product.specifications->>'shopName' ILIKE :search OR product.specifications->>'address' ILIKE :search)", { search: `%${query.search.trim()}%` });

    const radiusKm = query.radiusKm ?? 25;
    const records = (await qb.getMany()).map((record) => ({ record, distanceKm: Number(this.distance(latitude, longitude, record.latitude!, record.longitude!).toFixed(2)) })).filter((item) => item.distanceKm <= radiusKm);
    const sellerIds = [...new Set(records.map((item) => item.record.sellerId))];
    const sellers = sellerIds.length ? await this.userRepository.createQueryBuilder('user').where('user.id IN (:...sellerIds)', { sellerIds }).getMany() : [];
    const sellerById = new Map(sellers.map((seller) => [seller.id, seller]));
    const grouped = new Map<string, any>();
    for (const { record, distanceKm } of records) {
      const seller = sellerById.get(record.sellerId);
      const specs = record.specifications ?? {};
      const current = grouped.get(record.sellerId) ?? { sellerId: record.sellerId, shopName: String(specs.shopName ?? seller?.shopName ?? ''), address: String(specs.address ?? seller?.address ?? ''), phoneNumber: seller?.phoneNumber ?? '', latitude: record.latitude, longitude: record.longitude, distanceKm, medicines: [] };
      current.distanceKm = Math.min(current.distanceKm, distanceKm);
      current.medicines.push({ productId: record.id, medicineCode: record.catalogCode, medicineName: record.title, type: record.productKind, stockQuantity: record.stock, unit: record.unit ?? specs.unit ?? '', price: record.price });
      grouped.set(record.sellerId, current);
    }
    const data = [...grouped.values()].sort((a, b) => a.distanceKm - b.distanceKm);
    return { data, meta: { latitude, longitude, radiusKm, shopCount: data.length, productCount: records.length, catalog: 'marketplace_products' } };
  }

  private toLegacyInventory(product: MarketplaceProduct) {
    const specs = product.specifications ?? {};
    return { ...toApiEntity(product), productId: product.id, medicineCode: product.catalogCode, medicineName: product.title, type: product.productKind, stockQuantity: product.stock, unit: product.unit ?? specs.unit ?? '', shopName: specs.shopName ?? '', address: specs.address ?? '', active: product.status === 'published' };
  }

  private distance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const radius = 6371;
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1); const dLng = toRadians(lng2 - lng1);
    const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }
}
