// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'api_error.model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ApiErrorModel _$ApiErrorModelFromJson(Map<String, dynamic> json) =>
    _ApiErrorModel(
      message: json['message'] as String,
      statusCode: (json['statusCode'] as num?)?.toInt(),
      details:
          (json['details'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const <String>[],
    );

Map<String, dynamic> _$ApiErrorModelToJson(_ApiErrorModel instance) =>
    <String, dynamic>{
      'message': instance.message,
      'statusCode': instance.statusCode,
      'details': instance.details,
    };
