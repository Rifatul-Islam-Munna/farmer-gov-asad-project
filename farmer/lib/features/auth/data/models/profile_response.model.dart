import 'package:freezed_annotation/freezed_annotation.dart';

import 'user.model.dart';

part 'profile_response.model.freezed.dart';
part 'profile_response.model.g.dart';

@freezed
abstract class ProfileResponseModel with _$ProfileResponseModel {
  const factory ProfileResponseModel({required UserModel data}) =
      _ProfileResponseModel;

  factory ProfileResponseModel.fromJson(Map<String, dynamic> json) =>
      _$ProfileResponseModelFromJson(json);
}
