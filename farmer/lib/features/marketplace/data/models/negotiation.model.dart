class NegotiationModel {
  const NegotiationModel({
    required this.id,
    required this.listingId,
    required this.buyerId,
    required this.farmerId,
    required this.quantity,
    required this.unitPrice,
    required this.status,
    this.buyerAccepted = false,
    this.farmerAccepted = false,
  });

  final String id;
  final String listingId;
  final String buyerId;
  final String farmerId;
  final double quantity;
  final double unitPrice;
  final String status;
  final bool buyerAccepted;
  final bool farmerAccepted;

  factory NegotiationModel.fromJson(Map<String, dynamic> json) {
    return NegotiationModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      listingId: json['listingId'] as String? ?? '',
      buyerId: json['buyerId'] as String? ?? '',
      farmerId: json['farmerId'] as String? ?? '',
      quantity: (json['quantity'] as num?)?.toDouble() ?? 0,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0,
      status: json['status'] as String? ?? '',
      buyerAccepted: json['buyerAccepted'] as bool? ?? false,
      farmerAccepted: json['farmerAccepted'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'listingId': listingId,
    'buyerId': buyerId,
    'farmerId': farmerId,
    'quantity': quantity,
    'unitPrice': unitPrice,
    'status': status,
    'buyerAccepted': buyerAccepted,
    'farmerAccepted': farmerAccepted,
  };
}
