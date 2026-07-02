import 'package:freezed_annotation/freezed_annotation.dart';

part 'api_error.model.freezed.dart';
part 'api_error.model.g.dart';

@freezed
abstract class ApiErrorModel with _$ApiErrorModel {
  const factory ApiErrorModel({
    required String message,
    int? statusCode,
    @Default(<String>[]) List<String> details,
  }) = _ApiErrorModel;

  factory ApiErrorModel.fromJson(Map<String, dynamic> json) =>
      _$ApiErrorModelFromJson(json);
}
