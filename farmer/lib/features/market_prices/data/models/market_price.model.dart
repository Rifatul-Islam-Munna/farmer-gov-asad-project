class MarketPriceModel {
  const MarketPriceModel({
    required this.goodCode,
    required this.goodName,
    required this.unit,
    required this.governmentPrice,
    required this.marketPrice,
    required this.previousMarketPrice,
    required this.region,
    required this.marketName,
    this.imageUrl,
    required this.priceDate,
    required this.difference,
    required this.percentageChange,
    required this.trend,
  });

  final String goodCode;
  final String goodName;
  final String unit;
  final double governmentPrice;
  final double marketPrice;
  final double previousMarketPrice;
  final String region;
  final String marketName;
  final String? imageUrl;
  final DateTime priceDate;
  final double difference;
  final double percentageChange;
  final String trend;

  factory MarketPriceModel.fromJson(Map<String, dynamic> json) {
    return MarketPriceModel(
      goodCode: json['goodCode'] as String? ?? '',
      goodName: json['goodName'] as String? ?? '',
      unit: json['unit'] as String? ?? '',
      governmentPrice: (json['governmentPrice'] as num?)?.toDouble() ?? 0,
      marketPrice: (json['marketPrice'] as num?)?.toDouble() ?? 0,
      previousMarketPrice:
          (json['previousMarketPrice'] as num?)?.toDouble() ?? 0,
      region: json['region'] as String? ?? '',
      marketName: json['marketName'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
      priceDate:
          DateTime.tryParse(json['priceDate']?.toString() ?? '') ??
          DateTime.fromMillisecondsSinceEpoch(0),
      difference: (json['difference'] as num?)?.toDouble() ?? 0,
      percentageChange: (json['percentageChange'] as num?)?.toDouble() ?? 0,
      trend: json['trend'] as String? ?? 'same',
    );
  }

  Map<String, dynamic> toJson() => {
    'goodCode': goodCode,
    'goodName': goodName,
    'unit': unit,
    'governmentPrice': governmentPrice,
    'marketPrice': marketPrice,
    'previousMarketPrice': previousMarketPrice,
    'region': region,
    'marketName': marketName,
    if (imageUrl != null) 'imageUrl': imageUrl,
    'priceDate': priceDate.toIso8601String(),
    'difference': difference,
    'percentageChange': percentageChange,
    'trend': trend,
  };
}
