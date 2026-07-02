import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/network/network_client.dart';

class DocumentUploadApi {
  DocumentUploadApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<String> upload(XFile file) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/documents/upload',
      data: FormData.fromMap({
        'file': await MultipartFile.fromFile(
          file.path,
          filename: file.name,
        ),
      }),
    );
    final data = Map<String, dynamic>.from(response.data?['data'] as Map);
    return data['url'].toString();
  }
}
