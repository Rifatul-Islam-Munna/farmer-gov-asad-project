import 'package:dio/dio.dart';

import '../../../core/network/network_client.dart';
import 'nearby_seller.model.dart';

class NearbySellerApi {
  NearbySellerApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<List<NearbyShopModel>> findNearby({
    String? search,
    double radiusKm = 25,
  }) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/medicine-sellers/nearby/mine',
      queryParameters: {
        'radiusKm': radiusKm,
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      },
    );
    final raw = response.data?['data'];
    if (raw is! List) return const <NearbyShopModel>[];
    return raw
        .whereType<Map>()
        .map(
          (item) => NearbyShopModel.fromJson(Map<String, dynamic>.from(item)),
        )
        .toList(growable: false);
  }
}
