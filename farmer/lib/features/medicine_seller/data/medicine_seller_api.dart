import 'package:dio/dio.dart';

import '../../../core/network/network_client.dart';

class MedicineSellerApi {
  MedicineSellerApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<List<Map<String, dynamic>>> catalog() async {
    final response = await _client.get<Map<String, dynamic>>('/medicines');
    final items = response.data?['data'] as List<dynamic>? ?? const [];
    return items
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }
}
