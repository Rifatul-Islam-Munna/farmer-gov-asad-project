import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/network/network_client.dart';
import '../../../../core/storage/session_storage.dart';
import '../models/profile_response.model.dart';
import '../models/user.model.dart';

class ProfileApi {
  ProfileApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<UserModel> getMyProfile() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/user/get-my-profile',
    );
    return _readAndSave(response.data);
  }

  Future<UserModel> updateProfile(Map<String, dynamic> data) async {
    final response = await _client.patch<Map<String, dynamic>>(
      '/user/profile',
      data: data,
    );
    return _readAndSave(response.data);
  }

  Future<UserModel> updateLocation({
    required double latitude,
    required double longitude,
  }) async {
    final response = await _client.patch<Map<String, dynamic>>(
      '/user/location',
      data: {'latitude': latitude, 'longitude': longitude},
    );
    return _readAndSave(response.data);
  }

  Future<UserModel> _readAndSave(Map<String, dynamic>? responseData) async {
    final model = ProfileResponseModel.fromJson(responseData ?? const {});
    await GetIt.I<SessionStorage>().saveProfile(
      role: model.data.role.name,
      name: model.data.name,
      status: model.data.verificationStatus,
    );
    return model.data;
  }
}
