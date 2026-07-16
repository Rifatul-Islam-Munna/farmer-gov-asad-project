import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/network/network_client.dart';

class DetectionApi {
  DetectionApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<Map<String, dynamic>> diagnose(XFile image) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/diagnosis/analyze',
      data: FormData.fromMap({
        'image': await MultipartFile.fromFile(image.path, filename: image.name),
      }),
    );
    return Map<String, dynamic>.from(response.data?['data'] as Map);
  }

  Future<Map<String, dynamic>> identifyGood(XFile image) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/goods/detect',
      data: FormData.fromMap({
        'image': await MultipartFile.fromFile(image.path, filename: image.name),
      }),
    );
    return Map<String, dynamic>.from(response.data?['data'] as Map);
  }
}
