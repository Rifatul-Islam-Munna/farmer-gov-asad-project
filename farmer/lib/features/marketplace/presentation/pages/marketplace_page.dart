import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../market_prices/data/datasources/market_price_api.dart';
import '../../../market_prices/data/models/market_price.model.dart';
import '../widgets/buyer_listing_browser.dart';
import '../widgets/generalized_product_browser.dart';
import '../widgets/buyer_orders_panel.dart';
import '../widgets/bulk_purchase_panel.dart';

@RoutePage()
class MarketplacePage extends StatefulWidget {
  const MarketplacePage({super.key});

  @override
  State<MarketplacePage> createState() => _MarketplacePageState();
}

class _MarketplacePageState extends State<MarketplacePage> {
  late Future<List<MarketPriceModel>> _prices;

  @override
  void initState() {
    super.initState();
    _prices = MarketPriceApi().getLatest();
  }

  Future<void> _reload() async {
    setState(() => _prices = MarketPriceApi().getLatest());
    await _prices;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Marketplace', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
            Text('Real listings from farmers and approved sellers', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ],
        ),
        actions: [
          IconButton(onPressed: _reload, tooltip: 'Refresh prices', icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _reload,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
          children: [
            GlassCard(
              borderRadius: 26,
              padding: const EdgeInsets.all(18),
              child: Row(
                children: [
                  Container(
                    width: 66,
                    height: 66,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: .14),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(Icons.storefront_rounded, color: AppColors.primary, size: 34),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Buy and sell with verified data', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900)),
                        SizedBox(height: 5),
                        Text('Search crops, livestock, fish, machinery, seeds, fertilizer, feed and services.'),
                      ],
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: () => context.router.push(const SellProductRoute()),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('Sell'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            GeneralizedProductBrowser(),
            const SizedBox(height: 18),
            const BuyerOrdersPanel(),
            const SizedBox(height: 18),
            const BulkPurchasePanel(),
            const SizedBox(height: 24),
            const Text(
              'Farmer output listings',
              style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 10),
            const BuyerListingBrowser(),
            const SizedBox(height: 24),
            const Text('Latest reference prices', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900)),
            const SizedBox(height: 10),
            FutureBuilder<List<MarketPriceModel>>(
              future: _prices,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()));
                }
                if (snapshot.hasError) {
                  return const GlassCard(child: Padding(padding: EdgeInsets.all(18), child: Text('Could not load market prices.')));
                }
                final items = snapshot.data ?? const <MarketPriceModel>[];
                if (items.isEmpty) {
                  return const GlassCard(child: Padding(padding: EdgeInsets.all(18), child: Text('No market prices available.')));
                }
                return Column(
                  children: items.take(6).map((price) => Padding(
                    padding: const EdgeInsets.only(bottom: 9),
                    child: GlassCard(
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Color(0xFFEAF4E6),
                          foregroundColor: AppColors.primary,
                          child: Icon(Icons.show_chart_rounded),
                        ),
                        title: Text(price.goodName, style: const TextStyle(fontWeight: FontWeight.w800)),
                        subtitle: Text('Government ${price.governmentPrice.toStringAsFixed(0)} BDT/${price.unit}'),
                        trailing: Text(
                          '${price.marketPrice.toStringAsFixed(0)} BDT',
                          style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900),
                        ),
                      ),
                    ),
                  )).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
