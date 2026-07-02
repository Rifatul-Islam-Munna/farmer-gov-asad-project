import 'package:freezed_annotation/freezed_annotation.dart';

part 'listing.model.freezed.dart';
part 'listing.model.g.dart';

@freezed
abstract class ListingModel with _$ListingModel {
  const factory ListingModel({
    @JsonKey(name: '_id') required String id,
    required String ownerId,
    String? assistingAgentId,
    required String goodCode,
    required String goodName,
    @Default(<String>[]) List<String> imageUrls,
    required double quantity,
    @Default(0) double reservedQuantity,
    @Default(0) double availableQuantity,
    required String unit,
    String? grade,
    String? address,
    required double governmentPrice,
    required double marketPrice,
    required double minimumPrice,
    required String status,
  }) = _ListingModel;

  factory ListingModel.fromJson(Map<String, dynamic> json) =>
      _$ListingModelFromJson(json);
}
