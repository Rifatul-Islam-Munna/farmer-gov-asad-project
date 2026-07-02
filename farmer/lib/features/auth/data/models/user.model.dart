import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.model.freezed.dart';
part 'user.model.g.dart';

enum UserRole {
  admin,
  agent,
  farmer,
  buyer,
  medicineSeller,
}

@freezed
abstract class UserModel with _$UserModel {
  const factory UserModel({
    @JsonKey(name: '_id') required String id,
    required String name,
    required String phoneNumber,
    required UserRole role,
    String? email,
    double? landAmount,
    @Default(<String>[]) List<String> documents,
    String? businessName,
    String? shopName,
    String? address,
    @Default('approved') String verificationStatus,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
