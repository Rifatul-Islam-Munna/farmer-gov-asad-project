import 'package:dio/dio.dart';

import 'request_error.dart';

abstract final class DioFailureMapper {
  static RequestFailure fromException(DioException error) {
    final data = error.response?.data;
    final rawMessage = data is Map ? data['message'] : null;

    if (rawMessage is List) {
      final details = rawMessage.map((item) => item.toString()).toList();
      return RequestFailure(
        message: details.isEmpty ? 'Request failed' : details.first,
        statusCode: error.response?.statusCode,
        details: details,
      );
    }

    if (rawMessage != null) {
      return RequestFailure(
        message: rawMessage.toString(),
        statusCode: error.response?.statusCode,
      );
    }

    return RequestFailure(
      message: error.message ?? 'Something went wrong. Please try again.',
      statusCode: error.response?.statusCode,
    );
  }
}
