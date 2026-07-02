import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../../main.dart' show logger;
import '../../router/app_router.dart';
import '../../router/router_instance.dart';
import '../storage/user_storage.dart';

class DioHelper {
  DioHelper._();

  static Dio? _dio;
  static bool _isRedirecting = false;

  static Dio get dio {
    final client = _dio;
    if (client == null) {
      throw StateError('DioHelper.init() must be called before API requests.');
    }
    return client;
  }

  static String get _baseUrl {
    final configuredUrl = dotenv.get(
      'API_URL',
      fallback: 'http://10.0.2.2:4000',
    );
    final normalizedUrl = configuredUrl.trim().replaceFirst(RegExp(r'/$'), '');
    final uri = Uri.tryParse(normalizedUrl);

    if (uri == null ||
        !{'http', 'https'}.contains(uri.scheme) ||
        uri.host.isEmpty) {
      throw StateError(
        'Invalid API_URL in .env. Use a complete HTTP or HTTPS URL.',
      );
    }

    return normalizedUrl;
  }

  static void init() {
    final baseUrl = _baseUrl;
    logger.i('API base URL: $baseUrl');

    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        receiveDataWhenStatusError: true,
        connectTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 60),
        contentType: Headers.jsonContentType,
        headers: const {Headers.acceptHeader: Headers.jsonContentType},
      ),
    );

    _dio!.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await UserStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['access_token'] = token;
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          logger.e(
            'API request failed: ${error.requestOptions.uri}',
            error: error.error ?? error,
            stackTrace: error.stackTrace,
          );

          if (error.response?.statusCode == 401 && !_isRedirecting) {
            _isRedirecting = true;
            await UserStorage.clear();
            Future.microtask(() {
              appRouter.replaceAll([const LoginRoute()]);
            });
            _isRedirecting = false;
          }

          handler.next(error);
        },
      ),
    );

    _dio!.interceptors.add(
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseHeader: false,
        responseBody: true,
        compact: true,
        maxWidth: 90,
      ),
    );
  }
}
