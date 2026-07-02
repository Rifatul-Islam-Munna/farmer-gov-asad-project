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
    final model = ProfileResponseModel.fromJson(response.data ?? const {});
    await GetIt.I<SessionStorage>().saveProfile(
      role: model.data.role.name,
      name: model.data.name,
      status: model.data.verificationStatus,
    );
    return model.data;
  }
}
