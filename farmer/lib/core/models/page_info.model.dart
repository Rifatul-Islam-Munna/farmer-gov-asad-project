import 'package:freezed_annotation/freezed_annotation.dart';

part 'page_info.model.freezed.dart';
part 'page_info.model.g.dart';

@freezed
abstract class PageInfoModel with _$PageInfoModel {
  const factory PageInfoModel({
    required int currentPage,
    required int pageSize,
    required int itemCount,
    required int pageCount,
  }) = _PageInfoModel;

  factory PageInfoModel.fromJson(Map<String, dynamic> json) =>
      _$PageInfoModelFromJson(json);
}
