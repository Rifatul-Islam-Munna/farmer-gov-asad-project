import 'dart:io';

import 'package:dio/dio.dart';

import '../errors/failure.dart';

Failure failureFromDio(DioException error) {
  final response = error.response;
  if (response != null) {
    final message = _serverMessage(response.data) ??
        _defaultServerMessage(response.statusCode);
    final requestId = response.data is Map
        ? response.data['requestId']?.toString()
        : null;
    final details = response.data is Map ? response.data['details'] : null;

    if (response.statusCode == 401) {
      return UnauthorizedFailure(
        message,
        details: details,
        requestId: requestId,
      );
    }
    if (response.statusCode == 400 || response.statusCode == 422) {
      return ValidationFailure(
        message,
        statusCode: response.statusCode,
        details: details,
        requestId: requestId,
      );
    }
    return ServerFailure(
      message,
      statusCode: response.statusCode,
      details: details,
      requestId: requestId,
    );
  }

  final cause = error.error;
  final details = '${cause ?? error.message ?? ''}'.toLowerCase();

  if (cause is HandshakeException ||
      cause is CertificateException ||
      details.contains('certificate') ||
      details.contains('handshake')) {
    return const NetworkFailure(
      'Secure connection failed. Check device date and time, then try again.',
    );
  }

  if (error.type == DioExceptionType.cancel) {
    return const NetworkFailure('Request cancelled.');
  }

  if (cause is SocketException) {
    if (details.contains('network is unreachable') ||
        details.contains('not connected to internet')) {
      return const NetworkFailure('No internet connection.');
    }
    if (details.contains('failed host lookup') ||
        details.contains('nodename nor servname')) {
      return const NetworkFailure(
        'Cannot find the server. Check your connection and try again.',
      );
    }
  }

  if (error.type == DioExceptionType.connectionTimeout ||
      error.type == DioExceptionType.sendTimeout ||
      error.type == DioExceptionType.receiveTimeout) {
    return const NetworkFailure('The server took too long to respond.');
  }

  return const NetworkFailure(
    'Could not connect to the server. Try another network or try again.',
  );
}

String? _serverMessage(dynamic data) {
  if (data is String && data.trim().isNotEmpty) {
    return _looksLikeHtml(data) ? null : data.trim();
  }
  if (data is! Map) return null;

  final rawMessage = data['message'];
  if (rawMessage is String && rawMessage.trim().isNotEmpty) {
    return _looksLikeHtml(rawMessage) ? null : rawMessage.trim();
  }
  if (rawMessage is List && rawMessage.isNotEmpty) {
    return rawMessage.map((item) => item.toString()).join('\n');
  }
  if (rawMessage is Map) return _serverMessage(rawMessage);
  return null;
}

String _defaultServerMessage(int? statusCode) {
  if (statusCode == 404) {
    return 'The requested data was not found.';
  }
  if (statusCode != null && statusCode >= 500) {
    return 'The server is having trouble. Please try again later.';
  }
  return 'Unable to load data. Please try again.';
}

bool _looksLikeHtml(String value) {
  final lower = value.toLowerCase();
  return lower.contains('<!doctype html') ||
      lower.contains('<html') ||
      lower.contains('<head') ||
      lower.contains('<body');
}
