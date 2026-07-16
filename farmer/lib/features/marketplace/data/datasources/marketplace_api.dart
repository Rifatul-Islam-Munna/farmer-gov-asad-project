import 'package:dio/dio.dart';

import '../../../../core/network/network_client.dart';
import '../models/listing.model.dart';
import '../models/negotiation.model.dart';

class MarketplaceApi {
  MarketplaceApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<List<ListingModel>> searchListings({String? search}) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/listings',
      queryParameters: {
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      },
    );
    return _list(response.data?['data'], ListingModel.fromJson);
  }

  Future<List<ListingModel>> myListings() async {
    final response = await _client.get<Map<String, dynamic>>('/listings/mine');
    return _list(response.data?['data'], ListingModel.fromJson);
  }

  Future<ListingModel> createListing(Map<String, dynamic> payload) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/listings',
      data: payload,
    );
    return ListingModel.fromJson(
      Map<String, dynamic>.from(response.data?['data'] as Map),
    );
  }

  Future<NegotiationModel> createOffer({
    required String listingId,
    required double quantity,
    required double unitPrice,
  }) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/offers',
      data: {
        'listingId': listingId,
        'quantity': quantity,
        'unitPrice': unitPrice,
      },
    );
    return NegotiationModel.fromJson(
      Map<String, dynamic>.from(response.data?['data'] as Map),
    );
  }

  Future<List<NegotiationModel>> myOffers() async {
    final response = await _client.get<Map<String, dynamic>>('/offers/mine');
    return _list(response.data?['data'], NegotiationModel.fromJson);
  }

  Future<List<Map<String, dynamic>>> myDeals() async {
    final response = await _client.get<Map<String, dynamic>>('/deals/mine');
    final items = response.data?['data'] as List<dynamic>? ?? const [];
    return items
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<NegotiationModel> counterOffer({
    required String id,
    required double quantity,
    required double unitPrice,
  }) async {
    final response = await _client.patch<Map<String, dynamic>>(
      '/offers/$id/counter',
      data: {'quantity': quantity, 'unitPrice': unitPrice},
    );
    return NegotiationModel.fromJson(
      Map<String, dynamic>.from(response.data?['data'] as Map),
    );
  }

  Future<Map<String, dynamic>> acceptOffer(String id) async {
    final response = await _client.patch<Map<String, dynamic>>(
      '/offers/$id/accept',
    );
    return Map<String, dynamic>.from(response.data?['data'] as Map);
  }

  Future<NegotiationModel> rejectOffer(String id) async {
    final response = await _client.patch<Map<String, dynamic>>(
      '/offers/$id/reject',
    );
    return NegotiationModel.fromJson(
      Map<String, dynamic>.from(response.data?['data'] as Map),
    );
  }

  List<T> _list<T>(Object? raw, T Function(Map<String, dynamic>) fromJson) {
    final items = raw as List<dynamic>? ?? const [];
    return items
        .map((item) => fromJson(Map<String, dynamic>.from(item as Map)))
        .toList(growable: false);
  }
}
