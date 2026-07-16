class ListingModel {
  const ListingModel({
    required this.id,
    required this.ownerId,
    this.assistingAgentId,
    required this.goodCode,
    required this.goodName,
    this.imageUrls = const <String>[],
    required this.quantity,
    this.reservedQuantity = 0,
    this.availableQuantity = 0,
    required this.unit,
    this.grade,
    this.address,
    required this.governmentPrice,
    required this.marketPrice,
    required this.minimumPrice,
    required this.status,
  });

  final String id;
  final String ownerId;
  final String? assistingAgentId;
  final String goodCode;
  final String goodName;
  final List<String> imageUrls;
  final double quantity;
  final double reservedQuantity;
  final double availableQuantity;
  final String unit;
  final String? grade;
  final String? address;
  final double governmentPrice;
  final double marketPrice;
  final double minimumPrice;
  final String status;

  factory ListingModel.fromJson(Map<String, dynamic> json) {
    final images = json['imageUrls'];
    final quantity = (json['quantity'] as num?)?.toDouble() ?? 0;
    final reserved = (json['reservedQuantity'] as num?)?.toDouble() ?? 0;
    return ListingModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      ownerId: json['ownerId'] as String? ?? '',
      assistingAgentId: json['assistingAgentId'] as String?,
      goodCode: json['goodCode'] as String? ?? '',
      goodName: json['goodName'] as String? ?? '',
      imageUrls: images is List
          ? images.map((item) => item.toString()).toList(growable: false)
          : const <String>[],
      quantity: quantity,
      reservedQuantity: reserved,
      availableQuantity:
          (json['availableQuantity'] as num?)?.toDouble() ??
          (quantity - reserved).clamp(0, double.infinity).toDouble(),
      unit: json['unit'] as String? ?? 'kg',
      grade: json['grade'] as String?,
      address: json['address'] as String?,
      governmentPrice: (json['governmentPrice'] as num?)?.toDouble() ?? 0,
      marketPrice: (json['marketPrice'] as num?)?.toDouble() ?? 0,
      minimumPrice: (json['minimumPrice'] as num?)?.toDouble() ?? 0,
      status: json['status'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'ownerId': ownerId,
    if (assistingAgentId != null) 'assistingAgentId': assistingAgentId,
    'goodCode': goodCode,
    'goodName': goodName,
    'imageUrls': imageUrls,
    'quantity': quantity,
    'reservedQuantity': reservedQuantity,
    'availableQuantity': availableQuantity,
    'unit': unit,
    if (grade != null) 'grade': grade,
    if (address != null) 'address': address,
    'governmentPrice': governmentPrice,
    'marketPrice': marketPrice,
    'minimumPrice': minimumPrice,
    'status': status,
  };
}
