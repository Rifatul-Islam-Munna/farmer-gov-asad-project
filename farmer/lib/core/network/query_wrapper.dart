import 'package:cached_query/cached_query.dart';
import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../errors/failure.dart';
import 'dio_failure.dart';
import 'network_client.dart';

Query<Either<Failure, T>> createApiQuery<T>({
  required String key,
  required String path,
  required T Function(dynamic json) fromJson,
  Map<String, dynamic>? queryParameters,
  Duration cacheDuration = const Duration(minutes: 5),
  Duration storageDuration = const Duration(hours: 1),
  bool refetchOnResume = true,
  bool refetchOnConnection = true,
}) {
  return Query<Either<Failure, T>>(
    key: key,
    queryFn: () => makeGetRequest<T>(
      path: path,
      fromJson: fromJson,
      queryParameters: queryParameters,
    ),
    config: QueryConfig(
      cacheDuration: cacheDuration,
      storageDuration: storageDuration,
      refetchOnResume: refetchOnResume,
      refetchOnConnection: refetchOnConnection,
    ),
  );
}

Future<Either<Failure, T>> makeGetRequest<T>({
  required String path,
  required T Function(dynamic json) fromJson,
  Map<String, dynamic>? queryParameters,
  CancelToken? cancelToken,
}) async {
  try {
    final response = await DioHelper.dio.get<dynamic>(
      path,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
    );
    return Right(fromJson(response.data));
  } on DioException catch (error) {
    return Left(failureFromDio(error));
  } catch (error) {
    return Left(ServerFailure('Unexpected error: $error'));
  }
}
