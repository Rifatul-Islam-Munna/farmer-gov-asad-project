import 'package:dio/dio.dart';

import '../../../../core/network/network_client.dart';
import '../models/listing.model.dart';
import '../models/negotiation.model.dart';

class MarketplaceApi {
  MarketplaceApi({Dio? client}) : _client = client ?? DioHelper.dio;

  final Dio _client;

  Future<ListingPage> searchListings({
    String? search,
    String? category,
    String? address,
    String? grade,
    double? minimumPrice,
    double? maximumPrice,
    double? minimumQuantity,
    bool? deliveryAvailable,
    bool? negotiable,
    String sortBy = 'newest',
    int page = 1,
    int pageSize = 20,
  }) async {
    final queryParameters = <String, dynamic>{
      'sortBy': sortBy,
      'page': page,
      'pageSize': pageSize,
    };
    if (search?.trim().isNotEmpty == true) {
      queryParameters['search'] = search!.trim();
    }
    if (category?.isNotEmpty == true) queryParameters['category'] = category;
    if (address?.trim().isNotEmpty == true) {
      queryParameters['address'] = address!.trim();
    }
    if (grade?.trim().isNotEmpty == true) {
      queryParameters['grade'] = grade!.trim();
    }
    if (minimumPrice != null) queryParameters['minimumPrice'] = minimumPrice;
    if (maximumPrice != null) queryParameters['maximumPrice'] = maximumPrice;
    if (minimumQuantity != null) {
      queryParameters['minimumQuantity'] = minimumQuantity;
    }
    if (deliveryAvailable != null) {
      queryParameters['deliveryAvailable'] = deliveryAvailable;
    }
    if (negotiable != null) queryParameters['negotiable'] = negotiable;

    final response = await _client.get<Map<String, dynamic>>(
      '/listings',
      queryParameters: queryParameters,
    );
    final pagination = Map<String, dynamic>.from(
      response.data?['pagination'] as Map? ?? const {},
    );
    return ListingPage(
      items: _list(response.data?['data'], ListingModel.fromJson),
      page: (pagination['page'] as num?)?.toInt() ?? page,
      totalPages: (pagination['totalPages'] as num?)?.toInt() ?? 1,
      total: (pagination['total'] as num?)?.toInt() ?? 0,
      hasNextPage: pagination['hasNextPage'] as bool? ?? false,
    );
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
    return Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
  }

  Future<NegotiationModel> rejectOffer(String id) async {
    final response = await _client.patch<Map<String, dynamic>>(
      '/offers/$id/reject',
    );
    return NegotiationModel.fromJson(
      Map<String, dynamic>.from(response.data?['data'] as Map),
    );
  }

  Future<List<Map<String, dynamic>>> searchProducts({
    String? query,
    String? categoryCode,
    String? transactionType,
  }) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/products',
      queryParameters: {
        if (query?.trim().isNotEmpty == true) 'q': query!.trim(),
        if (categoryCode?.isNotEmpty == true) 'categoryCode': categoryCode,
        if (transactionType?.isNotEmpty == true)
          'transactionType': transactionType,
        'limit': 50,
      },
    );
    final payload = Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
    return (payload['items'] as List<dynamic>? ?? const [])
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<List<Map<String, dynamic>>> voiceSearch(String transcript) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/marketplace/voice-search',
      data: {'transcript': transcript, 'language': 'bn-BD'},
    );
    final payload = Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
    return (payload['items'] as List<dynamic>? ?? const [])
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<void> toggleFavorite(String productId) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/favorites',
      data: {'productId': productId},
    );
  }

  Future<List<Map<String, dynamic>>> getFavorites() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/favorites',
    );
    final raw = response.data?['data'] as List<dynamic>? ?? const [];
    return raw
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<List<Map<String, dynamic>>> getSavedSearches() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/saved-searches',
    );
    final raw = response.data?['data'] as List<dynamic>? ?? const [];
    return raw
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<void> saveSearch({
    required String name,
    required String query,
    String? transactionType,
  }) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/saved-searches',
      data: {
        'name': name,
        'query': query,
        'filters': {
          if (transactionType?.isNotEmpty == true)
            'transactionType': transactionType,
        },
      },
    );
  }

  Future<void> deleteSavedSearch(String id) async {
    await _client.delete<Map<String, dynamic>>(
      '/marketplace/saved-searches/$id',
    );
  }

  Future<void> addToCart(String productId, {int quantity = 1}) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/cart',
      data: {'productId': productId, 'quantity': quantity},
    );
  }

  Future<List<Map<String, dynamic>>> getCart() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/cart',
    );
    final raw = response.data?['data'] as List<dynamic>? ?? const [];
    return raw
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<Map<String, dynamic>> checkout({required String address}) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/marketplace/checkout',
      data: {
        'deliveryAddress': {'address': address},
      },
    );
    return Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
  }

  Future<void> bookRental({
    required String productId,
    required DateTime startsAt,
    required DateTime endsAt,
  }) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/rentals',
      data: {
        'productId': productId,
        'startsAt': startsAt.toUtc().toIso8601String(),
        'endsAt': endsAt.toUtc().toIso8601String(),
      },
    );
  }

  Future<List<Map<String, dynamic>>> getBulkRequests() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/bulk-requests',
    );
    final raw = response.data?['data'] as List<dynamic>? ?? const [];
    return raw
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<Map<String, dynamic>> getBulkRequest(String requestId) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/bulk-requests/$requestId',
    );
    return Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
  }

  Future<void> createBulkRequest(Map<String, dynamic> payload) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/bulk-requests',
      data: payload,
    );
  }

  Future<void> submitBulkOffer(
    String requestId,
    Map<String, dynamic> payload,
  ) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/bulk-requests/$requestId/offers',
      data: payload,
    );
  }

  Future<void> selectBulkOffer(String requestId, String offerId) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/bulk-requests/$requestId/offers/$offerId/select',
    );
  }

  Future<List<Map<String, dynamic>>> getAuctions() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/auctions',
    );
    final raw = response.data?['data'] as List<dynamic>? ?? const [];
    return raw
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<void> placeBid(String auctionId, double amount) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/auctions/$auctionId/bids',
      data: {'amount': amount},
    );
  }

  Future<void> sendMessage({
    required String receiverId,
    required String message,
    String? productId,
  }) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/messages',
      data: {
        'receiverId': receiverId,
        'message': message,
        'productId': ?productId,
      },
    );
  }

  Future<Map<String, dynamic>> createProduct(
    Map<String, dynamic> payload,
  ) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/marketplace/products',
      data: payload,
    );
    return Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
  }

  Future<List<Map<String, dynamic>>> getSellerProducts() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/seller/products',
    );
    final raw = response.data?['data'] as List<dynamic>? ?? const [];
    return raw
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<Map<String, dynamic>> requestDescription(String productId) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/marketplace/products/$productId/description-draft',
    );
    return Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
  }

  Future<Map<String, dynamic>> requestBackgroundRemoval(
    String productId,
  ) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/marketplace/products/$productId/image-edit',
    );
    return Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
  }

  Future<List<Map<String, dynamic>>> getAiTasks({String? productId}) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/seller/ai-tasks',
      queryParameters: {'productId': ?productId},
    );
    final raw = response.data?['data'] as List<dynamic>? ?? const [];
    return raw
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<void> reviewAiTask(String taskId, String decision) async {
    await _client.post<Map<String, dynamic>>(
      '/marketplace/seller/ai-tasks/$taskId/review',
      data: {'decision': decision},
    );
  }

  Future<Map<String, dynamic>> getPriceGuidance(String productId) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/products/$productId/price-guidance',
    );
    return Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
  }

  Future<List<Map<String, dynamic>>> getOrders() async {
    final response = await _client.get<Map<String, dynamic>>(
      '/marketplace/orders',
    );
    final raw = response.data?['data'] as List<dynamic>? ?? const [];
    return raw
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
  }

  Future<String> getInvoiceLink(String orderId) async {
    final response = await _client.get<Map<String, dynamic>>(
      '/billing/orders/$orderId/invoice-link',
    );
    final payload = Map<String, dynamic>.from(
      response.data?['data'] as Map? ?? response.data ?? const {},
    );
    return payload['url'] as String;
  }

  List<T> _list<T>(Object? raw, T Function(Map<String, dynamic>) fromJson) {
    final items = raw as List<dynamic>? ?? const [];
    return items
        .map((item) => fromJson(Map<String, dynamic>.from(item as Map)))
        .toList(growable: false);
  }
}
