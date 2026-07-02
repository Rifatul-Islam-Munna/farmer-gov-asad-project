import 'package:freezed_annotation/freezed_annotation.dart';

part 'market_price.model.freezed.dart';
part 'market_price.model.g.dart';

@freezed
abstract class MarketPriceModel with _$MarketPriceModel {
  const factory MarketPriceModel({
    required String goodCode,
    required String goodName,
    required String unit,
    required double governmentPrice,
    required double marketPrice,
    required double previousMarketPrice,
    required String region,
    required String marketName,
    String? imageUrl,
    required DateTime priceDate,
    required double difference,
    required double percentageChange,
    required String trend,
  }) = _MarketPriceModel;

  factory MarketPriceModel.fromJson(Map<String, dynamic> json) =>
      _$MarketPriceModelFromJson(json);
}
