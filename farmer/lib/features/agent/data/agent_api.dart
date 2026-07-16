import 'package:dio/dio.dart';

import '../../../core/network/network_client.dart';

class AgentApi {
  AgentApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<Map<String, dynamic>> requestFarmer(
    Map<String, dynamic> payload,
  ) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/agents/farmer-requests',
      data: payload,
    );
    return Map<String, dynamic>.from(response.data?['data'] as Map);
  }

  Future<Map<String, dynamic>> requestListing(
    Map<String, dynamic> payload,
  ) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/agents/listing-requests',
      data: payload,
    );
    return Map<String, dynamic>.from(response.data?['data'] as Map);
  }

  Future<Map<String, dynamic>> verify({
    required String actionId,
    required String otp,
  }) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/agents/verify-action',
      data: {'actionId': actionId, 'otp': otp},
    );
    return Map<String, dynamic>.from(response.data?['data'] as Map);
  }

  Future<List<Map<String, dynamic>>> searchFarmers(String search) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/agents/farmers',
      queryParameters: {if (search.trim().isNotEmpty) 'search': search.trim()},
    );
    return _list(response.data?['data']);
  }

  Future<List<Map<String, dynamic>>> history() async {
    final response = await _client.get<Map<String, dynamic>>('/agents/history');
    return _list(response.data?['data']);
  }

  List<Map<String, dynamic>> _list(Object? raw) {
    final items = raw as List<dynamic>? ?? const [];
    return items
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }
}
