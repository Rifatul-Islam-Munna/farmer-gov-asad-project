// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'good.model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_GoodModel _$GoodModelFromJson(Map<String, dynamic> json) => _GoodModel(
  id: json['_id'] as String?,
  code: json['code'] as String,
  name: json['name'] as String,
  localName: json['localName'] as String?,
  categoryCode: json['categoryCode'] as String,
  defaultUnit: json['defaultUnit'] as String,
  imageUrl: json['imageUrl'] as String?,
  active: json['active'] as bool? ?? true,
);

Map<String, dynamic> _$GoodModelToJson(_GoodModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'code': instance.code,
      'name': instance.name,
      'localName': instance.localName,
      'categoryCode': instance.categoryCode,
      'defaultUnit': instance.defaultUnit,
      'imageUrl': instance.imageUrl,
      'active': instance.active,
    };
