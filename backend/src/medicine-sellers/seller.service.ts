import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { USER_MODEL, User, UserType } from '../user/user.entity';
import {
  MEDICINE_MODEL,
  Medicine,
  SELLER_INVENTORY_MODEL,
  SellerInventory,
} from './medicine.entity';
import {
  NearbySellerQueryDto,
  UpdateSellerLocationDto,
  UpsertInventoryDto,
} from './seller-inventory.dto';

@Injectable()
export class SellerService {
  constructor(
    @InjectModel(MEDICINE_MODEL)
    private readonly medicineModel: Model<Medicine>,
    @InjectModel(SELLER_INVENTORY_MODEL)
    private readonly inventoryModel: Model<SellerInventory>,
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<User>,
  ) {}

  async updateLocation(sellerId: string, dto: UpdateSellerLocationDto) {
    const data = await this.userModel
      .findOneAndUpdate(
        { _id: sellerId, role: UserType.MEDICINE_SELLER },
        {
          shopName: dto.shopName.trim(),
          address: dto.address.trim(),
          location: {
            latitude: dto.latitude,
            longitude: dto.longitude,
          },
        },
        { returnDocument: 'after' },
      )
      .select('-credentialHash')
      .lean();
    if (!data) {
      throw new NotFoundException('Medicine seller not found');
    }
    return { data };
  }

  async upsertInventory(sellerId: string, dto: UpsertInventoryDto) {
    const medicineCode = dto.medicineCode.trim().toLowerCase();
    const [medicine, seller] = await Promise.all([
      this.medicineModel.findOne({ code: medicineCode, active: true }).lean(),
      this.userModel
        .findOne({ _id: sellerId, role: UserType.MEDICINE_SELLER })
        .lean(),
    ]);

    if (!medicine) {
      throw new NotFoundException('Medicine catalog item not found');
    }
    if (!seller) {
      throw new NotFoundException('Medicine seller not found');
    }
    if (
      seller.location?.latitude == null ||
      seller.location.longitude == null ||
      !seller.shopName ||
      !seller.address
    ) {
      throw new BadRequestException('Set shop name and location first');
    }

    const data = await this.inventoryModel.findOneAndUpdate(
      { sellerId, medicineCode },
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
        latitude: seller.location.latitude,
        longitude: seller.location.longitude,
        active: dto.active ?? true,
      },
      { upsert: true, returnDocument: 'after' },
    );
    return { data };
  }

  async mine(sellerId: string) {
    return {
      data: await this.inventoryModel
        .find({ sellerId })
        .sort({ medicineName: 1 })
        .lean(),
    };
  }

  async nearby(query: NearbySellerQueryDto) {
    const filter: FilterQuery<SellerInventory> = {
      active: true,
      stockQuantity: { $gt: 0 },
    };
    if (query.medicineCode?.trim()) {
      filter.medicineCode = query.medicineCode.trim().toLowerCase();
    }
    if (query.search?.trim()) {
      const pattern = new RegExp(this.escape(query.search.trim()), 'i');
      filter.$or = [
        { medicineName: pattern },
        { shopName: pattern },
        { address: pattern },
      ];
    }

    const radiusKm = query.radiusKm ?? 25;
    const records = await this.inventoryModel.find(filter).lean();
    const data = records
      .map((record) => ({
        ...record,
        distanceKm: Number(
          this.distance(
            query.latitude,
            query.longitude,
            record.latitude,
            record.longitude,
          ).toFixed(2),
        ),
      }))
      .filter((record) => record.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return { data };
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

  private escape(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
