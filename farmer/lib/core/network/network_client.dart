import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get_it/get_it.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../../main.dart' show logger;
import '../navigation/app_router_instance.dart';
import '../router/app_router.dart';
import '../storage/session_storage.dart';

class ApiException implements Exception {
  const ApiException({
    required this.message,
    required this.statusCode,
    this.details,
    this.requestId,
  });

  final String message;
  final int statusCode;
  final Object? details;
  final String? requestId;

  @override
  String toString() => message;
}

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
    final configuredUrl = dotenv.get('API_URL', fallback: '').split('#').first.trim();
    if (configuredUrl.isEmpty) {
      throw StateError('API_URL is missing from the Flutter .env file.');
    }

    var normalizedUrl = configuredUrl;
    if (!normalizedUrl.contains('://')) {
      final lower = normalizedUrl.toLowerCase();
      final local = lower.startsWith('localhost') ||
          lower.startsWith('127.0.0.1') ||
          lower.startsWith('10.0.2.2');
      normalizedUrl = '${local ? 'http' : 'https'}://$normalizedUrl';
    }

    normalizedUrl = normalizedUrl.replaceFirst(RegExp(r'/+$'), '');
    var uri = Uri.tryParse(normalizedUrl);
    if (uri == null || uri.host.isEmpty) {
      throw StateError('API_URL must be a complete valid URL.');
    }

    final localHost = uri.host == 'localhost' ||
        uri.host == '127.0.0.1' ||
        uri.host == '10.0.2.2';
    if (uri.scheme != 'https' && !(uri.scheme == 'http' && localHost)) {
      throw StateError('Use HTTPS, or HTTP only for local development.');
    }

    if (!kIsWeb && Platform.isAndroid &&
        (uri.host == 'localhost' || uri.host == '127.0.0.1')) {
      uri = uri.replace(host: '10.0.2.2');
    }

    return uri.toString().replaceFirst(RegExp(r'/+$'), '');
  }

  static void init() {
    final baseUrl = _baseUrl;
    if (kDebugMode) logger.i('API base URL: $baseUrl');

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
          final token = await GetIt.I<SessionStorage>().getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
            options.headers['access_token'] = token;
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (kDebugMode) {
            logger.e(
              'API request failed: ${error.requestOptions.uri}',
              error: error.error ?? error,
              stackTrace: error.stackTrace,
            );
          }

          if (error.response?.statusCode == 401 && !_isRedirecting) {
            _isRedirecting = true;
            try {
              await GetIt.I<SessionStorage>().clear();
              if (appRouter.current.name != LoginRoute.name) {
                await appRouter.replaceAll([const LoginRoute()]);
              }
            } finally {
              _isRedirecting = false;
            }
          }

          final body = error.response?.data;
          final rawMessage = body is Map<String, dynamic> ? body['message'] : null;
          final message = rawMessage is List
              ? rawMessage.join(', ')
              : rawMessage?.toString() ?? error.message ?? 'Request failed';
          final apiException = ApiException(
            message: message,
            statusCode: error.response?.statusCode ?? 500,
            details: body is Map<String, dynamic> ? body['details'] : null,
            requestId: body is Map<String, dynamic>
                ? body['requestId']?.toString()
                : null,
          );
          handler.next(error.copyWith(error: apiException));
        },
      ),
    );

    if (kDebugMode) {
      _dio!.interceptors.add(
        PrettyDioLogger(
          requestHeader: false,
          requestBody: true,
          responseHeader: false,
          responseBody: true,
          compact: true,
          maxWidth: 90,
        ),
      );
    }
  }
}
