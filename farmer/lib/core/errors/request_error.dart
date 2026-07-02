class RequestFailure {
  const RequestFailure({
    required this.message,
    this.statusCode,
    this.details = const <String>[],
  });

  final String message;
  final int? statusCode;
  final List<String> details;
}
