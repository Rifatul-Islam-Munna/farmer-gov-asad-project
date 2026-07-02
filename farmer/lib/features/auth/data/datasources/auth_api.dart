import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/network/network_client.dart';
import '../../../../core/storage/session_storage.dart';
import '../models/auth_response.model.dart';
import '../models/login_request.model.dart';
import '../models/register_request.model.dart';

class AuthApi {
  AuthApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<AuthResponseModel> login(LoginRequestModel request) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/user/login-user',
      data: request.toJson(),
    );

    final model = AuthResponseModel.fromJson(response.data ?? const {});
    await _saveSession(model);
    return model;
  }

  Future<AuthResponseModel> register(RegisterRequestModel request) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/user',
      data: request.toJson(),
    );

    final model = AuthResponseModel.fromJson(response.data ?? const {});
    await _saveSession(model);
    return model;
  }

  Future<void> logout() async {
    try {
      await _client.post<void>('/user/logout');
    } on DioException {
      // A local logout must still complete when the token is expired or offline.
    } finally {
      await GetIt.I<SessionStorage>().clear();
    }
  }

  Future<void> _saveSession(AuthResponseModel response) {
    return GetIt.I<SessionStorage>().saveSession(
      token: response.accessToken,
      role: response.user.role.name,
      name: response.user.name,
      status: response.user.verificationStatus,
    );
  }
}
