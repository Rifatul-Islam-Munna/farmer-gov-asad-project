import 'package:freezed_annotation/freezed_annotation.dart';

import 'market_price.model.dart';

part 'market_price_list_response.model.freezed.dart';
part 'market_price_list_response.model.g.dart';

@freezed
abstract class MarketPriceListResponseModel
    with _$MarketPriceListResponseModel {
  const factory MarketPriceListResponseModel({
    required List<MarketPriceModel> data,
  }) = _MarketPriceListResponseModel;

  factory MarketPriceListResponseModel.fromJson(Map<String, dynamic> json) =>
      _$MarketPriceListResponseModelFromJson(json);
}
