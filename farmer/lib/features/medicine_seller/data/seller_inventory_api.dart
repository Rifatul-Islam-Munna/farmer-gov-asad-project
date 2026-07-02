import 'package:dio/dio.dart';

import '../../../core/network/network_client.dart';

class SellerInventoryApi {
  SellerInventoryApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<void> updateLocation({
    required String shopName,
    required String address,
    required double latitude,
    required double longitude,
  }) async {
    await _client.patch<void>(
      '/medicine-sellers/location',
      data: {
        'shopName': shopName,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
      },
    );
  }

  Future<void> saveItem({
    required String medicineCode,
    required double stockQuantity,
    required String unit,
    required double price,
  }) async {
    await _client.post<void>(
      '/medicine-sellers/inventory',
      data: {
        'medicineCode': medicineCode,
        'stockQuantity': stockQuantity,
        'unit': unit,
        'price': price,
      },
    );
  }

  Future<List<Map<String, dynamic>>> mine() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/medicine-sellers/inventory/mine',
    );
    return _list(response.data?['data']);
  }

  Future<List<Map<String, dynamic>>> nearby({
    required double latitude,
    required double longitude,
    required String medicineCode,
  }) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/medicine-sellers/nearby',
      queryParameters: {
        'latitude': latitude,
        'longitude': longitude,
        'medicineCode': medicineCode,
      },
    );
    return _list(response.data?['data']);
  }

  List<Map<String, dynamic>> _list(Object? raw) {
    final items = raw as List<dynamic>? ?? const [];
    return items
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }
}
