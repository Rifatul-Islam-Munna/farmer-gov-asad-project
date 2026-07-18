class ListingModel {
  const ListingModel({
    required this.id,
    required this.ownerId,
    this.assistingAgentId,
    this.category = 'agriculturalOutput',
    this.transactionType = 'sale',
    required this.goodCode,
    required this.goodName,
    this.description,
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
    this.negotiable = true,
    this.deliveryAvailable = false,
    required this.status,
  });

  final String id;
  final String ownerId;
  final String? assistingAgentId;
  final String category;
  final String transactionType;
  final String goodCode;
  final String goodName;
  final String? description;
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
  final bool negotiable;
  final bool deliveryAvailable;
  final String status;

  factory ListingModel.fromJson(Map<String, dynamic> json) {
    final images = json['imageUrls'];
    final quantity = (json['quantity'] as num?)?.toDouble() ?? 0;
    final reserved = (json['reservedQuantity'] as num?)?.toDouble() ?? 0;
    return ListingModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      ownerId: json['ownerId'] as String? ?? '',
      assistingAgentId: json['assistingAgentId'] as String?,
      category: json['category'] as String? ?? 'agriculturalOutput',
      transactionType: json['transactionType'] as String? ?? 'sale',
      goodCode: json['goodCode'] as String? ?? '',
      goodName: json['goodName'] as String? ?? '',
      description: json['description'] as String?,
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
      negotiable: json['negotiable'] as bool? ?? true,
      deliveryAvailable: json['deliveryAvailable'] as bool? ?? false,
      status: json['status'] as String? ?? '',
    );
  }
}

class ListingPage {
  const ListingPage({
    required this.items,
    required this.page,
    required this.totalPages,
    required this.total,
    required this.hasNextPage,
  });

  final List<ListingModel> items;
  final int page;
  final int totalPages;
  final int total;
  final bool hasNextPage;
}
