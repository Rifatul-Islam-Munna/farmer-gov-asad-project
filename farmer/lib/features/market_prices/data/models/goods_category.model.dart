import 'package:freezed_annotation/freezed_annotation.dart';

part 'goods_category.model.freezed.dart';
part 'goods_category.model.g.dart';

@freezed
abstract class GoodsCategoryModel with _$GoodsCategoryModel {
  const factory GoodsCategoryModel({
    @JsonKey(name: '_id') String? id,
    required String code,
    required String name,
    String? localName,
    String? icon,
    @Default(true) bool active,
  }) = _GoodsCategoryModel;

  factory GoodsCategoryModel.fromJson(Map<String, dynamic> json) =>
      _$GoodsCategoryModelFromJson(json);
}
