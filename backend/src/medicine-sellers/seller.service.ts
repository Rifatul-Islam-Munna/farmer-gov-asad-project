import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { User, UserType } from '../user/entities/user.entity';
import { Medicine, SellerInventory } from './entities/medicine.entity';
import {
  NearbySellerFilterDto,
  NearbySellerQueryDto,
  UpdateSellerLocationDto,
  UpsertInventoryDto,
} from './dto/seller-inventory.dto';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(SellerInventory)
    private readonly inventoryRepository: Repository<SellerInventory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateLocation(sellerId: string, dto: UpdateSellerLocationDto) {
    const seller = await this.userRepository.findOne({
      where: { id: sellerId, role: UserType.MEDICINE_SELLER },
    });
    if (!seller) throw new NotFoundException('Medicine seller not found');
    seller.shopName = dto.shopName.trim();
    seller.address = dto.address.trim();
    seller.location = {
      latitude: dto.latitude,
      longitude: dto.longitude,
      updatedAt: new Date().toISOString(),
    };
    await this.userRepository.save(seller);
    return { data: toApiEntity(seller) };
  }

  async upsertInventory(sellerId: string, dto: UpsertInventoryDto) {
    const medicineCode = dto.medicineCode.trim().toLowerCase();
    const [medicine, seller] = await Promise.all([
      this.medicineRepository.findOne({
        where: { code: medicineCode, active: true },
      }),
      this.userRepository.findOne({
        where: { id: sellerId, role: UserType.MEDICINE_SELLER },
      }),
    ]);
    if (!medicine)
      throw new NotFoundException('Medicine catalog item not found');
    if (!seller) throw new NotFoundException('Medicine seller not found');

    const latitude = seller.location?.latitude;
    const longitude = seller.location?.longitude;
    if (
      latitude == null ||
      longitude == null ||
      !seller.shopName ||
      !seller.address
    ) {
      throw new BadRequestException('Set shop name and location first');
    }

    await this.inventoryRepository.upsert(
      {
        sellerId,
        medicineCode,
        medicineName: medicine.name,
        type: medicine.type,
        stockQuantity: dto.stockQuantity,
        unit: dto.unit.trim(),
        price: dto.price,
        shopName: seller.shopName,
        address: seller.address,
        latitude,
        longitude,
        active: dto.active ?? true,
      },
      ['sellerId', 'medicineCode'],
    );
    const data = await this.inventoryRepository.findOneByOrFail({
      sellerId,
      medicineCode,
    });
    return { data: toApiEntity(data) };
  }

  async mine(sellerId: string) {
    const data = await this.inventoryRepository.find({
      where: { sellerId },
      order: { medicineName: 'ASC' },
    });
    return { data: data.map(toApiEntity) };
  }

  async nearbyForUser(userId: string, query: NearbySellerFilterDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const latitude = user?.location?.latitude;
    const longitude = user?.location?.longitude;
    if (latitude == null || longitude == null) {
      throw new BadRequestException(
        'Location is not saved yet. Allow location access and try again.',
      );
    }
    return this.findNearby(latitude, longitude, query);
  }

  async nearby(query: NearbySellerQueryDto) {
    return this.findNearby(query.latitude, query.longitude, query);
  }

  private async findNearby(
    latitude: number,
    longitude: number,
    query: NearbySellerFilterDto,
  ) {
    const qb = this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.active = true')
      .andWhere('inventory.stockQuantity > 0');
    if (query.medicineCode?.trim()) {
      qb.andWhere('inventory.medicineCode = :medicineCode', {
        medicineCode: query.medicineCode.trim().toLowerCase(),
      });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(inventory.medicineName ILIKE :search OR inventory.shopName ILIKE :search OR inventory.address ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    const radiusKm = query.radiusKm ?? 25;
    const records = (await qb.getMany())
      .map((record) => ({
        ...record,
        distanceKm: Number(
          this.distance(
            latitude,
            longitude,
            record.latitude,
            record.longitude,
          ).toFixed(2),
        ),
      }))
      .filter((record) => record.distanceKm <= radiusKm);

    const sellerIds = [...new Set(records.map((item) => item.sellerId))];
    const sellers = sellerIds.length
      ? await this.userRepository
          .createQueryBuilder('user')
          .where('user.id IN (:...sellerIds)', { sellerIds })
          .getMany()
      : [];
    const phoneBySeller = new Map(
      sellers.map((seller) => [seller.id, seller.phoneNumber]),
    );

    type NearbySellerResult = {
      sellerId: string;
      shopName: string;
      address: string;
      phoneNumber: string;
      latitude: number;
      longitude: number;
      distanceKm: number;
      medicines: Array<{
        medicineCode: string;
        medicineName: string;
        type: string;
        stockQuantity: number;
        unit: string;
        price: number;
      }>;
    };
    const grouped = new Map<string, NearbySellerResult>();
    for (const record of records) {
      const current = grouped.get(record.sellerId) ?? {
        sellerId: record.sellerId,
        shopName: record.shopName,
        address: record.address,
        phoneNumber: phoneBySeller.get(record.sellerId) ?? '',
        latitude: record.latitude,
        longitude: record.longitude,
        distanceKm: record.distanceKm,
        medicines: [],
      };
      current.distanceKm = Math.min(
        Number(current.distanceKm),
        record.distanceKm,
      );
      (current.medicines as Array<Record<string, unknown>>).push({
        medicineCode: record.medicineCode,
        medicineName: record.medicineName,
        type: record.type,
        stockQuantity: record.stockQuantity,
        unit: record.unit,
        price: record.price,
      });
      grouped.set(record.sellerId, current);
    }

    const data = [...grouped.values()].sort(
      (a, b) => Number(a.distanceKm) - Number(b.distanceKm),
    );
    return {
      data,
      meta: {
        latitude,
        longitude,
        radiusKm,
        shopCount: data.length,
        productCount: records.length,
      },
    };
  }

  private distance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const radius = 6371;
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const value =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }
}
