import 'market_price.model.dart';

class MarketPriceListResponseModel {
  const MarketPriceListResponseModel({required this.data});

  final List<MarketPriceModel> data;

  factory MarketPriceListResponseModel.fromJson(Map<String, dynamic> json) {
    final rawData = json['data'];
    return MarketPriceListResponseModel(
      data: rawData is List
          ? rawData
              .whereType<Map>()
              .map(
                (item) => MarketPriceModel.fromJson(
                  Map<String, dynamic>.from(item),
                ),
              )
              .toList(growable: false)
          : const <MarketPriceModel>[],
    );
  }

  Map<String, dynamic> toJson() => {
        'data': data.map((item) => item.toJson()).toList(growable: false),
      };
}
