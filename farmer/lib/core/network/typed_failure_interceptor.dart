import 'package:dio/dio.dart';

import '../errors/dio_failure_mapper.dart';

class TypedFailureInterceptor extends Interceptor {
  @override
  void onError(DioException error, ErrorInterceptorHandler handler) {
    final failure = DioFailureMapper.fromException(error);
    handler.next(error.copyWith(error: failure));
  }
}
