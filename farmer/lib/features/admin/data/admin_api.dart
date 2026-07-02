import 'package:dio/dio.dart';

import '../../../core/network/network_client.dart';

class AdminApi {
  AdminApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<List<Map<String, dynamic>>> pendingUsers() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/admin/users/pending',
    );
    return _list(response.data?['data']);
  }

  Future<void> updateVerification(String userId, String status) async {
    await _client.patch<void>(
      '/admin/users/$userId/verification',
      data: {'status': status},
    );
  }

  Future<void> publishGuidance({
    required String type,
    required String title,
    required String message,
    required String targetRole,
  }) async {
    await _client.post<void>(
      '/admin/guidance',
      data: {
        'type': type,
        'title': title,
        'message': message,
        'targetRole': targetRole,
      },
    );
  }

  List<Map<String, dynamic>> _list(Object? raw) {
    final items = raw as List<dynamic>? ?? const [];
    return items
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }
}
