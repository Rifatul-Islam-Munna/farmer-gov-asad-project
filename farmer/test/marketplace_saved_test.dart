import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:farmer/features/marketplace/data/datasources/marketplace_api.dart';
import 'package:farmer/features/marketplace/presentation/widgets/generalized_product_browser.dart';

class FakeMarketplaceApi extends MarketplaceApi {
  FakeMarketplaceApi() : super(client: Dio());

  final products = <Map<String, dynamic>>[
    {
      'id': 'product-1',
      'title': 'Power Tiller',
      'description': 'Farm machinery',
      'categoryCode': 'machinery',
      'transactionType': 'sale',
      'price': 120000,
      'currency': 'BDT',
      'imageUrls': <String>[],
      'sellerId': 'seller-1',
    },
  ];

  final favorites = <Map<String, dynamic>>[
    {
      'id': 'favorite-1',
      'productId': 'product-1',
      'product': {
        'id': 'product-1',
        'title': 'Power Tiller',
        'price': 120000,
        'currency': 'BDT',
      },
    },
  ];

  final searches = <Map<String, dynamic>>[
    {
      'id': 'search-1',
      'name': 'Rental equipment',
      'query': 'tractor',
      'filters': {'transactionType': 'rental'},
    },
  ];

  @override
  Future<List<Map<String, dynamic>>> searchProducts({
    String? query,
    String? categoryCode,
    String? transactionType,
  }) async => products;

  @override
  Future<List<Map<String, dynamic>>> getFavorites() async => favorites;

  @override
  Future<List<Map<String, dynamic>>> getSavedSearches() async => searches;

  @override
  Future<void> toggleFavorite(String productId) async {
    favorites.removeWhere((item) => item['productId'] == productId);
  }

  @override
  Future<void> deleteSavedSearch(String id) async {
    searches.removeWhere((item) => item['id'] == id);
  }
}

void main() {
  testWidgets('shows saved favorites and saved searches', (tester) async {
    final api = FakeMarketplaceApi();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: GeneralizedProductBrowser(api: api),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Power Tiller'), findsOneWidget);
    expect(find.byIcon(Icons.favorite_rounded), findsWidgets);

    await tester.tap(find.widgetWithText(OutlinedButton, 'Saved'));
    await tester.pumpAndSettle();

    expect(find.text('Saved marketplace'), findsOneWidget);
    expect(find.text('Rental equipment'), findsOneWidget);
    expect(find.text('tractor'), findsOneWidget);
  });

  testWidgets('saved search can be deleted', (tester) async {
    final api = FakeMarketplaceApi();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: GeneralizedProductBrowser(api: api),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(OutlinedButton, 'Saved'));
    await tester.pumpAndSettle();

    final deleteButtons = find.byTooltip('Delete saved search');
    expect(deleteButtons, findsOneWidget);
    await tester.tap(deleteButtons);
    await tester.pumpAndSettle();

    expect(api.searches, isEmpty);
    expect(find.text('Rental equipment'), findsNothing);
  });
}
