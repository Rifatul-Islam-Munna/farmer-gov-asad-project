// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'page_info.model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_PageInfoModel _$PageInfoModelFromJson(Map<String, dynamic> json) =>
    _PageInfoModel(
      currentPage: (json['currentPage'] as num).toInt(),
      pageSize: (json['pageSize'] as num).toInt(),
      itemCount: (json['itemCount'] as num).toInt(),
      pageCount: (json['pageCount'] as num).toInt(),
    );

Map<String, dynamic> _$PageInfoModelToJson(_PageInfoModel instance) =>
    <String, dynamic>{
      'currentPage': instance.currentPage,
      'pageSize': instance.pageSize,
      'itemCount': instance.itemCount,
      'pageCount': instance.pageCount,
    };
