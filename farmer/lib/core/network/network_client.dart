import 'dart:async';
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
  static Dio? _refreshClient;
  static bool _isRedirecting = false;
  static Future<bool>? _refreshInFlight;

  static Dio get dio {
    final client = _dio;
    if (client == null) {
      throw StateError('DioHelper.init() must be called before API requests.');
    }
    return client;
  }

  static String get socketBaseUrl => _baseUrl;

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

    if (!kIsWeb &&
        Platform.isAndroid &&
        (uri.host == 'localhost' || uri.host == '127.0.0.1')) {
      uri = uri.replace(host: '10.0.2.2');
    }

    return uri.toString().replaceFirst(RegExp(r'/+$'), '');
  }

  static void init() {
    final baseUrl = _baseUrl;
    if (kDebugMode) logger.i('API base URL: $baseUrl');

    final options = BaseOptions(
      baseUrl: baseUrl,
      receiveDataWhenStatusError: true,
      connectTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 60),
      contentType: Headers.jsonContentType,
      headers: const {Headers.acceptHeader: Headers.jsonContentType},
    );
    _dio = Dio(options);
    _refreshClient = Dio(options);

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

          final isUnauthorized = error.response?.statusCode == 401;
          final alreadyRetried = error.requestOptions.extra['authRetried'] == true;
          final isRefreshRequest =
              error.requestOptions.path.contains('/user/refresh-token');

          if (isUnauthorized && !alreadyRetried && !isRefreshRequest) {
            final refreshed = await _refreshOnce();
            if (refreshed) {
              try {
                final storage = GetIt.I<SessionStorage>();
                final accessToken = await storage.getToken();
                final request = error.requestOptions;
                request.extra['authRetried'] = true;
                request.headers['Authorization'] = 'Bearer $accessToken';
                request.headers['access_token'] = accessToken;
                final response = await _dio!.fetch<dynamic>(request);
                handler.resolve(response);
                return;
              } on DioException catch (retryError) {
                error = retryError;
              }
            }

            await _clearSessionAndRedirect();
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

  static Future<bool> _refreshOnce() {
    final existing = _refreshInFlight;
    if (existing != null) return existing;

    final completer = Completer<bool>();
    _refreshInFlight = completer.future;
    () async {
      try {
        final storage = GetIt.I<SessionStorage>();
        final refreshToken = await storage.getRefreshToken();
        if (refreshToken == null || refreshToken.isEmpty) {
          completer.complete(false);
          return;
        }

        final response = await _refreshClient!.post<Map<String, dynamic>>(
          '/user/refresh-token',
          data: {'refreshToken': refreshToken},
        );
        final data = response.data ?? const <String, dynamic>{};
        final accessToken = data['access_token']?.toString() ?? '';
        final nextRefreshToken = data['refresh_token']?.toString() ?? '';
        if (accessToken.isEmpty || nextRefreshToken.isEmpty) {
          completer.complete(false);
          return;
        }
        await storage.updateTokens(
          accessToken: accessToken,
          refreshToken: nextRefreshToken,
        );
        completer.complete(true);
      } on DioException {
        completer.complete(false);
      } finally {
        _refreshInFlight = null;
      }
    }();
    return completer.future;
  }

  static Future<void> _clearSessionAndRedirect() async {
    if (_isRedirecting) return;
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
}
