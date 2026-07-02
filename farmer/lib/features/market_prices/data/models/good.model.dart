import 'package:freezed_annotation/freezed_annotation.dart';

part 'good.model.freezed.dart';
part 'good.model.g.dart';

@freezed
abstract class GoodModel with _$GoodModel {
  const factory GoodModel({
    @JsonKey(name: '_id') String? id,
    required String code,
    required String name,
    String? localName,
    required String categoryCode,
    required String defaultUnit,
    String? imageUrl,
    @Default(true) bool active,
  }) = _GoodModel;

  factory GoodModel.fromJson(Map<String, dynamic> json) =>
      _$GoodModelFromJson(json);
}
