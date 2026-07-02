import 'package:dio/dio.dart';

import '../../../../core/network/network_client.dart';
import '../models/market_price_list_response.model.dart';
import '../models/market_price.model.dart';

class MarketPriceApi {
  MarketPriceApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<List<MarketPriceModel>> getLatest() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/market-prices/latest',
    );
    return MarketPriceListResponseModel.fromJson(
      response.data ?? const {},
    ).data;
  }

  Future<List<MarketPriceModel>> getHistory(String goodCode) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/market-prices/history/$goodCode',
    );
    return MarketPriceListResponseModel.fromJson(
      response.data ?? const {},
    ).data;
  }
}
