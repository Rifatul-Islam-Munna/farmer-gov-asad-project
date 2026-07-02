import 'package:freezed_annotation/freezed_annotation.dart';

part 'location.model.freezed.dart';
part 'location.model.g.dart';

@freezed
abstract class LocationModel with _$LocationModel {
  const factory LocationModel({
    String? address,
    String? district,
    String? division,
    double? latitude,
    double? longitude,
  }) = _LocationModel;

  factory LocationModel.fromJson(Map<String, dynamic> json) =>
      _$LocationModelFromJson(json);
}
