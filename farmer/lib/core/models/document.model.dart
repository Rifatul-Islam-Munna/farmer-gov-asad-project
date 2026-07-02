import 'package:freezed_annotation/freezed_annotation.dart';

part 'document.model.freezed.dart';
part 'document.model.g.dart';

@freezed
abstract class DocumentModel with _$DocumentModel {
  const factory DocumentModel({
    required String id,
    required String name,
    required String url,
    required String type,
    @Default('pending') String status,
  }) = _DocumentModel;

  factory DocumentModel.fromJson(Map<String, dynamic> json) =>
      _$DocumentModelFromJson(json);
}
