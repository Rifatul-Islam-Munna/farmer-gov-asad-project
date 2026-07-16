class NearbyMedicineModel {
  const NearbyMedicineModel({
    required this.medicineCode,
    required this.medicineName,
    required this.type,
    required this.stockQuantity,
    required this.unit,
    required this.price,
  });

  final String medicineCode;
  final String medicineName;
  final String type;
  final double stockQuantity;
  final String unit;
  final double price;

  factory NearbyMedicineModel.fromJson(Map<String, dynamic> json) {
    return NearbyMedicineModel(
      medicineCode: json['medicineCode'] as String? ?? '',
      medicineName: json['medicineName'] as String? ?? '',
      type: json['type'] as String? ?? '',
      stockQuantity: (json['stockQuantity'] as num?)?.toDouble() ?? 0,
      unit: json['unit'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
    );
  }
}

class NearbyShopModel {
  const NearbyShopModel({
    required this.sellerId,
    required this.shopName,
    required this.address,
    required this.phoneNumber,
    required this.latitude,
    required this.longitude,
    required this.distanceKm,
    required this.medicines,
  });

  final String sellerId;
  final String shopName;
  final String address;
  final String phoneNumber;
  final double latitude;
  final double longitude;
  final double distanceKm;
  final List<NearbyMedicineModel> medicines;

  factory NearbyShopModel.fromJson(Map<String, dynamic> json) {
    final medicines = json['medicines'];
    return NearbyShopModel(
      sellerId: json['sellerId'] as String? ?? '',
      shopName: json['shopName'] as String? ?? '',
      address: json['address'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 0,
      medicines: medicines is List
          ? medicines
                .whereType<Map>()
                .map(
                  (item) => NearbyMedicineModel.fromJson(
                    Map<String, dynamic>.from(item),
                  ),
                )
                .toList(growable: false)
          : const <NearbyMedicineModel>[],
    );
  }
}
