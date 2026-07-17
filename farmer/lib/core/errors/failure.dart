sealed class Failure {
  const Failure(this.message, {this.statusCode, this.details, this.requestId});

  final String message;
  final int? statusCode;
  final Object? details;
  final String? requestId;
}

final class ServerFailure extends Failure {
  const ServerFailure(
    super.message, {
    super.statusCode,
    super.details,
    super.requestId,
  });
}

final class NetworkFailure extends Failure {
  const NetworkFailure(super.message, {super.details});
}

final class ValidationFailure extends Failure {
  const ValidationFailure(
    super.message, {
    super.statusCode,
    super.details,
    super.requestId,
  });
}

final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure(
    super.message, {
    super.statusCode = 401,
    super.details,
    super.requestId,
  });
}
