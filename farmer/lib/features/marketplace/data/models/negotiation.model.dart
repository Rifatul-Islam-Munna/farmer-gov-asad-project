import 'package:freezed_annotation/freezed_annotation.dart';

part 'negotiation.model.freezed.dart';
part 'negotiation.model.g.dart';

@freezed
abstract class NegotiationModel with _$NegotiationModel {
  const factory NegotiationModel({
    @JsonKey(name: '_id') required String id,
    required String listingId,
    required String buyerId,
    required String farmerId,
    required double quantity,
    required double unitPrice,
    required String status,
    @Default(false) bool buyerAccepted,
    @Default(false) bool farmerAccepted,
  }) = _NegotiationModel;

  factory NegotiationModel.fromJson(Map<String, dynamic> json) =>
      _$NegotiationModelFromJson(json);
}
