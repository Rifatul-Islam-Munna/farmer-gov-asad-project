import 'package:dio/dio.dart';

import '../errors/dio_failure_mapper.dart';

class TypedFailureInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final failure = DioFailureMapper.fromException(err);
    handler.next(err.copyWith(error: failure));
  }
}
