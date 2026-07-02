import 'package:dio/dio.dart';

import '../../../../core/network/network_client.dart';
import '../models/good.model.dart';
import '../models/goods_category.model.dart';

class GoodsCatalogApi {
  GoodsCatalogApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<List<GoodsCategoryModel>> getCategories() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/goods/categories',
    );
    final items = response.data?['data'] as List<dynamic>? ?? const [];
    return items
        .map(
          (item) => GoodsCategoryModel.fromJson(
            Map<String, dynamic>.from(item as Map),
          ),
        )
        .toList(growable: false);
  }

  Future<List<GoodModel>> searchGoods({
    String? search,
    String? categoryCode,
  }) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/goods',
      queryParameters: {
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
        if (categoryCode != null && categoryCode.isNotEmpty)
          'categoryCode': categoryCode,
      },
    );
    final items = response.data?['data'] as List<dynamic>? ?? const [];
    return items
        .map(
          (item) => GoodModel.fromJson(
            Map<String, dynamic>.from(item as Map),
          ),
        )
        .toList(growable: false);
  }
}
