import 'package:cached_query/cached_query.dart';
import 'package:dio/dio.dart';

import '../errors/failure.dart';
import '../utils/app_toast.dart';
import 'dio_failure.dart';
import 'network_client.dart';

enum HttpMethod { post, put, patch, delete }

class MutationConfig<TData, TVariables> {
  const MutationConfig({
    required this.path,
    required this.method,
    this.key,
    this.successMessage,
    this.fromJson,
    this.toBody,
    this.onSuccess,
    this.onError,
  });

  final String path;
  final HttpMethod method;
  final String? key;
  final String? successMessage;
  final TData Function(dynamic json)? fromJson;
  final Object? Function(TVariables variables)? toBody;
  final void Function(TData data)? onSuccess;
  final void Function(Failure failure)? onError;
}

class MutationResult<TData> {
  const MutationResult({this.data, this.failure});

  final TData? data;
  final Failure? failure;

  bool get isSuccess => failure == null;
}

Mutation<MutationResult<TData>, TVariables> createApiMutation<
    TData, TVariables>({
  required MutationConfig<TData, TVariables> config,
}) {
  return Mutation<MutationResult<TData>, TVariables>(
    key: config.key ?? '${config.method.name}:${config.path}',
    mutationFn: (variables) => _execute(config, variables),
    onSuccess: (result, _) {
      if (result.isSuccess && result.data != null) {
        if (config.successMessage case final message?) {
          AppToast.success(message);
        }
        config.onSuccess?.call(result.data as TData);
        return;
      }

      final failure = result.failure ??
          const ServerFailure('The request could not be completed.');
      config.onError?.call(failure);
      if (config.onError == null) AppToast.error(failure.message);
    },
    onError: (error, _, _) {
      final failure = error is Failure
          ? error
          : ServerFailure(error.toString());
      config.onError?.call(failure);
      if (config.onError == null) AppToast.error(failure.message);
    },
  );
}

Future<MutationResult<TData>> _execute<TData, TVariables>(
  MutationConfig<TData, TVariables> config,
  TVariables variables,
) async {
  try {
    final body = config.toBody?.call(variables) ?? variables;
    final Response<dynamic> response;

    switch (config.method) {
      case HttpMethod.post:
        response = await DioHelper.dio.post<dynamic>(config.path, data: body);
      case HttpMethod.put:
        response = await DioHelper.dio.put<dynamic>(config.path, data: body);
      case HttpMethod.patch:
        response = await DioHelper.dio.patch<dynamic>(config.path, data: body);
      case HttpMethod.delete:
        response = await DioHelper.dio.delete<dynamic>(config.path, data: body);
    }

    final parsed = config.fromJson?.call(response.data) ?? response.data as TData;
    return MutationResult(data: parsed);
  } on DioException catch (error) {
    return MutationResult(failure: failureFromDio(error));
  } catch (error) {
    return MutationResult(
      failure: ServerFailure('Unexpected error: $error'),
    );
  }
}
