import 'package:dio/dio.dart';

import '../models/app_user.dart';
import '../network/dio_helper.dart';
import '../storage/user_storage.dart';

class AuthApi {
  AuthApi._();

  static Future<AppUser> login({
    required String phoneNumber,
    required String password,
  }) async {
    final response = await DioHelper.dio.post<Map<String, dynamic>>(
      '/user/login-user',
      data: {
        'phoneNumber': phoneNumber.trim(),
        'password': password,
      },
    );

    return _saveSession(response.data ?? const {});
  }

  static Future<AppUser> register({
    required String name,
    required String phoneNumber,
    required String password,
    required String role,
    double? landAmount,
    List<String> documents = const [],
  }) async {
    final response = await DioHelper.dio.post<Map<String, dynamic>>(
      '/user',
      data: {
        'name': name.trim(),
        'phoneNumber': phoneNumber.trim(),
        'password': password,
        'role': role,
        if (landAmount != null) 'landAmount': landAmount,
        if (documents.isNotEmpty) 'documents': documents,
      },
    );

    return _saveSession(response.data ?? const {});
  }

  static Future<void> logout() async {
    try {
      await DioHelper.dio.post<void>('/user/logout');
    } on DioException {
      // Local logout must still complete when the token is expired or offline.
    } finally {
      await UserStorage.clear();
    }
  }

  static Future<AppUser> _saveSession(Map<String, dynamic> response) async {
    final token = response['access_token']?.toString();
    final rawUser = response['user'] ?? response['data'];

    if (token == null || token.isEmpty || rawUser is! Map) {
      throw const FormatException('The server returned an invalid auth response.');
    }

    final user = AppUser.fromJson(Map<String, dynamic>.from(rawUser));
    await UserStorage.saveToken(token);
    await UserStorage.saveUser(user);
    return user;
  }
}
