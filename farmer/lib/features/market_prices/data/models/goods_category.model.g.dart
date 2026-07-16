// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'goods_category.model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_GoodsCategoryModel _$GoodsCategoryModelFromJson(Map<String, dynamic> json) =>
    _GoodsCategoryModel(
      id: json['_id'] as String?,
      code: json['code'] as String,
      name: json['name'] as String,
      localName: json['localName'] as String?,
      icon: json['icon'] as String?,
      active: json['active'] as bool? ?? true,
    );

Map<String, dynamic> _$GoodsCategoryModelToJson(_GoodsCategoryModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'code': instance.code,
      'name': instance.name,
      'localName': instance.localName,
      'icon': instance.icon,
      'active': instance.active,
    };
