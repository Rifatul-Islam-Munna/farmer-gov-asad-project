import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../market_prices/data/datasources/market_price_api.dart';
import '../../../market_prices/data/models/market_price.model.dart';

@RoutePage()
class MarketplacePage extends StatefulWidget {
  const MarketplacePage({super.key});

  @override
  State<MarketplacePage> createState() => _MarketplacePageState();
}

class _MarketplacePageState extends State<MarketplacePage> {
  late Future<List<MarketPriceModel>> _future;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _future = MarketPriceApi().getLatest();
  }

  Future<void> _reload() async {
    setState(() => _future = MarketPriceApi().getLatest());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Market prices'),
        actions: [
          IconButton(
            onPressed: _reload,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: FutureBuilder<List<MarketPriceModel>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _MessageState(
              icon: Icons.cloud_off_rounded,
              title: 'Could not load prices',
              message: 'Check the backend and API URL, then try again.',
              action: _reload,
            );
          }

          final prices = (snapshot.data ?? const <MarketPriceModel>[])
              .where((item) {
                final query = _search.toLowerCase();
                return query.isEmpty ||
                    item.goodName.toLowerCase().contains(query) ||
                    item.goodCode.toLowerCase().contains(query);
              })
              .toList(growable: false);

          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
              children: [
                const _MarketBanner(),
                const SizedBox(height: 14),
                FilledButton.icon(
                  onPressed: () =>
                      context.router.push(const SellProductRoute()),
                  icon: const Icon(Icons.add_business_rounded),
                  label: const Text('Sell a product'),
                ),
                const SizedBox(height: 18),
                TextField(
                  onChanged: (value) => setState(() => _search = value.trim()),
                  decoration: const InputDecoration(
                    hintText: 'Search goods',
                    prefixIcon: Icon(Icons.search_rounded),
                    suffixIcon: Icon(Icons.tune_rounded),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Today’s reference prices',
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                if (prices.isEmpty)
                  const _MessageCard(
                    icon: Icons.search_off_rounded,
                    text: 'No matching goods found.',
                  )
                else
                  ...prices.map(
                    (price) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _PriceCard(price: price),
                    ),
                  ),
                const _MessageCard(
                  icon: Icons.lightbulb_outline_rounded,
                  text:
                      'Compare the market price with the government rate before setting your minimum selling price.',
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _MarketBanner extends StatelessWidget {
  const _MarketBanner();

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: SizedBox(
        height: 170,
        child: Stack(
          fit: StackFit.expand,
          children: [
            CachedNetworkImage(
              imageUrl: 'https://picsum.photos/seed/farmer-market/900/500',
              fit: BoxFit.cover,
              errorWidget: (_, __, ___) => const ColoredBox(
                color: AppColors.primaryDark,
                child: Icon(
                  Icons.agriculture_rounded,
                  color: Colors.white,
                  size: 66,
                ),
              ),
            ),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xE61E4B2A), Color(0x882E6B3E)],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.all(22),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Know the fair price',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 23,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Government rates, market rates and daily movement in one place.',
                          style: TextStyle(color: Color(0xFFEAF6E7)),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.query_stats_rounded,
                    color: Colors.white,
                    size: 48,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PriceCard extends StatelessWidget {
  const _PriceCard({required this.price});

  final MarketPriceModel price;

  @override
  Widget build(BuildContext context) {
    final isUp = price.trend == 'up';
    final isDown = price.trend == 'down';
    final trendColor = isUp
        ? AppColors.primary
        : isDown
        ? AppColors.danger
        : AppColors.textSecondary;
    final trendIcon = isUp
        ? Icons.trending_up_rounded
        : isDown
        ? Icons.trending_down_rounded
        : Icons.trending_flat_rounded;

    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 27,
                backgroundColor: Colors.white.withValues(alpha: .12),
                foregroundColor: AppColors.primary,
                child: Icon(_goodIcon(price.goodCode), size: 29),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      price.goodName,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      price.marketName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  Icon(trendIcon, color: trendColor, size: 18),
                  const SizedBox(width: 4),
                  Text(
                    '${price.percentageChange >= 0 ? '+' : ''}${price.percentageChange.toStringAsFixed(1)}%',
                    style: TextStyle(
                      color: trendColor,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _ValueBox(
                  label: 'Market price',
                  value:
                      'BDT ${price.marketPrice.toStringAsFixed(0)}/${price.unit}',
                  primary: true,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ValueBox(
                  label: 'Government rate',
                  value:
                      'BDT ${price.governmentPrice.toStringAsFixed(0)}/${price.unit}',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  IconData _goodIcon(String code) {
    return switch (code) {
      'rice' => Icons.grain_rounded,
      'tomato' => Icons.eco_rounded,
      'onion' => Icons.spa_outlined,
      _ => Icons.agriculture_outlined,
    };
  }
}

class _ValueBox extends StatelessWidget {
  const _ValueBox({
    required this.label,
    required this.value,
    this.primary = false,
  });

  final String label;
  final String value;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(11),
      decoration: BoxDecoration(
        color: primary
            ? AppColors.primary.withValues(alpha: .12)
            : Colors.white.withValues(alpha: .07),
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: Colors.white.withValues(alpha: .10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: primary ? AppColors.primary : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageCard extends StatelessWidget {
  const _MessageCard({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(17),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.white.withValues(alpha: .12),
            foregroundColor: AppColors.primary,
            child: Icon(icon),
          ),
          const SizedBox(width: 13),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}

class _MessageState extends StatelessWidget {
  const _MessageState({
    required this.icon,
    required this.title,
    required this.message,
    required this.action,
  });

  final IconData icon;
  final String title;
  final String message;
  final Future<void> Function() action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 58, color: AppColors.primary),
            const SizedBox(height: 14),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: action,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Try again'),
            ),
          ],
        ),
      ),
    );
  }
}
