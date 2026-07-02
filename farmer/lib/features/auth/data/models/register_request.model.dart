import 'package:freezed_annotation/freezed_annotation.dart';

import 'user.model.dart';

part 'register_request.model.freezed.dart';
part 'register_request.model.g.dart';

@freezed
abstract class RegisterRequestModel with _$RegisterRequestModel {
  const factory RegisterRequestModel({
    required String name,
    required String phoneNumber,
    required String password,
    required UserRole role,
    String? email,
    double? landAmount,
    @Default(<String>[]) List<String> documents,
    String? businessName,
    String? shopName,
    String? address,
  }) = _RegisterRequestModel;

  factory RegisterRequestModel.fromJson(Map<String, dynamic> json) =>
      _$RegisterRequestModelFromJson(json);
}
