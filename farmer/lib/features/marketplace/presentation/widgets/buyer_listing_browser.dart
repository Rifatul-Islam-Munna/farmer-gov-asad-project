import 'package:farmer/core/widgets/glass_card.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../data/datasources/marketplace_api.dart';
import '../../data/models/listing.model.dart';

class BuyerListingBrowser extends StatefulWidget {
  const BuyerListingBrowser({super.key});

  @override
  State<BuyerListingBrowser> createState() => _BuyerListingBrowserState();
}

class _BuyerListingBrowserState extends State<BuyerListingBrowser> {
  final _search = TextEditingController();
  late Future<List<ListingModel>> _listings;

  @override
  void initState() {
    super.initState();
    _listings = MarketplaceApi().searchListings();
  }

  void _reload() {
    setState(() {
      _listings = MarketplaceApi().searchListings(search: _search.text);
    });
  }

  Future<void> _offer(ListingModel listing) async {
    final quantity = TextEditingController();
    final price = TextEditingController(
      text: listing.minimumPrice.toStringAsFixed(0),
    );
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Offer for ${listing.goodName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: quantity,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Quantity (${listing.unit})',
                prefixIcon: const Icon(Icons.scale_rounded),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: price,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Unit price',
                prefixIcon: Icon(Icons.payments_outlined),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Submit offer'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await MarketplaceApi().createOffer(
        listingId: listing.id,
        quantity: double.parse(quantity.text),
        unitPrice: double.parse(price.text),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Offer sent to the farmer.')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Farmer marketplace',
          style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _search,
          onSubmitted: (_) => _reload(),
          decoration: InputDecoration(
            hintText: 'Search farmer listings',
            prefixIcon: const Icon(Icons.search_rounded),
            suffixIcon: IconButton(
              onPressed: _reload,
              icon: const Icon(Icons.arrow_forward_rounded),
            ),
          ),
        ),
        const SizedBox(height: 10),
        FutureBuilder<List<ListingModel>>(
          future: _listings,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LinearProgressIndicator();
            }
            if (snapshot.hasError) {
              return GlassCard(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Text(snapshot.error.toString()),
                ),
              );
            }
            final items = snapshot.data ?? const <ListingModel>[];
            if (items.isEmpty) {
              return const GlassCard(
                child: Padding(
                  padding: EdgeInsets.all(18),
                  child: Text('No available farmer listings.'),
                ),
              );
            }
            return Column(
              children: items
                  .map(
                    (item) => GlassCard(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            const CircleAvatar(
                              backgroundColor: Color(0xFFEAF4E6),
                              foregroundColor: AppColors.primary,
                              child: Icon(Icons.agriculture_rounded),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.goodName,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  Text(
                                    '${item.availableQuantity.toStringAsFixed(0)} ${item.unit} ? ${item.address ?? 'Location not set'}',
                                  ),
                                  Text(
                                    'Minimum BDT ${item.minimumPrice.toStringAsFixed(0)}',
                                    style: const TextStyle(
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            FilledButton(
                              onPressed: () => _offer(item),
                              child: const Text('Offer'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                  .toList(growable: false),
            );
          },
        ),
      ],
    );
  }
}
