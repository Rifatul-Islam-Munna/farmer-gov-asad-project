import 'package:freezed_annotation/freezed_annotation.dart';

import 'user.model.dart';

part 'auth_response.model.freezed.dart';
part 'auth_response.model.g.dart';

@freezed
abstract class AuthResponseModel with _$AuthResponseModel {
  const factory AuthResponseModel({
    required String message,
    @JsonKey(name: 'access_token') required String accessToken,
    required UserModel user,
  }) = _AuthResponseModel;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseModelFromJson(json);
}
