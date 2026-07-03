import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_MODEL, User, UserType } from '../user/user.entity';
import {
  MEDICINE_MODEL,
  Medicine,
  SELLER_INVENTORY_MODEL,
  SellerInventory,
} from './medicine.entity';
import {
  NearbySellerFilterDto,
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
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )
      .select('-credentialHash -otpNumber')
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
    const location = seller.location;
    if (
      location?.latitude == null ||
      location.longitude == null ||
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
        latitude: location.latitude,
        longitude: location.longitude,
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

  async nearbyForUser(userId: string, query: NearbySellerFilterDto) {
    const user = await this.userModel
      .findById(userId)
      .select('location')
      .lean();
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
    const filter: Record<string, any> = {
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
    const nearbyRecords = records
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

    const sellerIds = [...new Set(nearbyRecords.map((item) => item.sellerId))];
    const sellers = sellerIds.length
      ? await this.userModel
          .find({ _id: { $in: sellerIds } })
          .select('phoneNumber')
          .lean()
      : [];
    const phoneBySeller = new Map(
      sellers.map((seller) => [String(seller._id), seller.phoneNumber]),
    );

    const grouped = new Map<string, Record<string, any>>();
    for (const record of nearbyRecords) {
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
      current.distanceKm = Math.min(current.distanceKm, record.distanceKm);
      current.medicines.push({
        medicineCode: record.medicineCode,
        medicineName: record.medicineName,
        type: record.type,
        stockQuantity: record.stockQuantity,
        unit: record.unit,
        price: record.price,
      });
      grouped.set(record.sellerId, current);
    }

    const data = ([...grouped.values()] as Array<Record<string, any>>)
      .map((shop): Record<string, any> => ({
        ...shop,
        medicines: shop.medicines.sort(
          (a: Record<string, any>, b: Record<string, any>) =>
            String(a.medicineName).localeCompare(String(b.medicineName)),
        ),
      }))
      .sort((a: Record<string, any>, b: Record<string, any>) =>
        Number(a.distanceKm) - Number(b.distanceKm),
      );

    return {
      data,
      meta: {
        latitude,
        longitude,
        radiusKm,
        shopCount: data.length,
        productCount: nearbyRecords.length,
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

  private escape(value: string) {
    const special = new Set(['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\']);
    return [...value].map((character) =>
      special.has(character) ? `\\${character}` : character,
    ).join('');
  }
}
