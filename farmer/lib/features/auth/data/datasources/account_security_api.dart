import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/network/network_client.dart';
import '../../../../core/storage/session_storage.dart';

class AccountSecurityApi {
  AccountSecurityApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<Map<String, dynamic>> requestPhoneVerification() async {
    final response = await _client.post<Map<String, dynamic>>(
      '/user/request-phone-verification',
    );
    return response.data ?? const <String, dynamic>{};
  }

  Future<void> confirmPhoneVerification(String code) async {
    await _client.post<void>(
      '/user/confirm-phone-verification',
      data: {'code': code},
    );
  }

  Future<Map<String, dynamic>> requestPasswordReset(String destination) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/user/password-reset/request',
      data: {'destination': destination},
    );
    return response.data ?? const <String, dynamic>{};
  }

  Future<void> confirmPasswordReset({
    required String destination,
    required String code,
    required String newPassword,
  }) async {
    await _client.post<void>(
      '/user/password-reset/confirm',
      data: {
        'destination': destination,
        'code': code,
        'newPassword': newPassword,
      },
    );
  }

  Future<void> changeActiveRole(String role) async {
    await _client.patch<void>('/user/active-role', data: {'role': role});
    await GetIt.I<SessionStorage>().clear();
  }

  Future<void> submitProfessionalReview({
    required String role,
    required List<Map<String, dynamic>> documents,
    required Map<String, bool> checklist,
  }) async {
    await _client.post<void>(
      '/professional-reviews/me',
      data: {
        'role': role,
        'documents': documents,
        'checklist': checklist,
      },
    );
  }
}
