import 'package:auto_route/auto_route.dart';
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
  String _category = 'All';
  _SortMode _sortMode = _SortMode.featured;

  static const _categories = ['All', 'Crops', 'Inputs', 'Seeds', 'Tools'];

  static const _products = [
    _StoreProduct(
      name: 'Premium Rice',
      category: 'Crops',
      unit: 'per kg',
      price: 48,
      seller: 'Rangpur Farm',
      icon: Icons.grain_rounded,
      accent: Color(0xFFB9E64B),
    ),
    _StoreProduct(
      name: 'Fresh Potato',
      category: 'Crops',
      unit: 'per kg',
      price: 55,
      seller: 'Local Seller',
      icon: Icons.eco_rounded,
      accent: Color(0xFFD6A35A),
    ),
    _StoreProduct(
      name: 'N-P-K Fertilizer',
      category: 'Inputs',
      unit: '5 kg pack',
      price: 1200,
      seller: 'Agro Supply',
      icon: Icons.inventory_2_rounded,
      accent: Color(0xFF5FE8C2),
    ),
    _StoreProduct(
      name: 'Pest Control Spray',
      category: 'Inputs',
      unit: '1 L bottle',
      price: 950,
      seller: 'Crop Care',
      icon: Icons.sanitizer_rounded,
      accent: Color(0xFF7DDC72),
    ),
    _StoreProduct(
      name: 'Tomato Seeds',
      category: 'Seeds',
      unit: 'hybrid pack',
      price: 450,
      seller: 'Seed House',
      icon: Icons.spa_rounded,
      accent: Color(0xFFFF7262),
    ),
    _StoreProduct(
      name: 'Hand Sprayer',
      category: 'Tools',
      unit: '8 L tank',
      price: 780,
      seller: 'Farm Tools BD',
      icon: Icons.water_drop_rounded,
      accent: Color(0xFF59B8FF),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _future = MarketPriceApi().getLatest();
  }

  Future<void> _reload() async {
    setState(() => _future = MarketPriceApi().getLatest());
    await _future;
  }

  List<_StoreProduct> get _visibleProducts {
    final query = _search.toLowerCase();
    final list = _products.where((product) {
      final categoryMatch = _category == 'All' || product.category == _category;
      final searchMatch =
          query.isEmpty ||
          product.name.toLowerCase().contains(query) ||
          product.seller.toLowerCase().contains(query) ||
          product.category.toLowerCase().contains(query);
      return categoryMatch && searchMatch;
    }).toList();

    switch (_sortMode) {
      case _SortMode.priceLow:
        list.sort((a, b) => a.price.compareTo(b.price));
      case _SortMode.priceHigh:
        list.sort((a, b) => b.price.compareTo(a.price));
      case _SortMode.name:
        list.sort((a, b) => a.name.compareTo(b.name));
      case _SortMode.featured:
        break;
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final products = _visibleProducts;

    return Scaffold(
      extendBody: true,
      appBar: AppBar(
        toolbarHeight: 58,
        titleSpacing: 18,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Marketplace',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
            ),
            SizedBox(height: 2),
            Text(
              'Buy inputs and sell crops',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh prices',
            onPressed: _reload,
            icon: const Icon(Icons.refresh_rounded),
          ),
          IconButton(
            tooltip: 'Cart',
            onPressed: () {},
            icon: const Icon(Icons.shopping_bag_outlined),
          ),
        ],
      ),
      body: FutureBuilder<List<MarketPriceModel>>(
        future: _future,
        builder: (context, snapshot) {
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
              padding: const EdgeInsets.fromLTRB(18, 10, 18, 126),
              children: [
                _HeroDeal(
                  onSell: () => context.router.push(const SellProductRoute()),
                ),
                const SizedBox(height: 16),
                _SearchAndFilter(
                  onSearch: (value) => setState(() => _search = value.trim()),
                  sortMode: _sortMode,
                  onSort: _showSortSheet,
                ),
                const SizedBox(height: 14),
                _CategoryChips(
                  categories: _categories,
                  selected: _category,
                  onSelected: (value) => setState(() => _category = value),
                ),
                const SizedBox(height: 20),
                _SectionHeader(
                  title: 'Shop products',
                  subtitle: '${products.length} items',
                ),
                const SizedBox(height: 12),
                if (products.isEmpty)
                  const _MessageCard(
                    icon: Icons.search_off_rounded,
                    text: 'No products found. Try another filter.',
                  )
                else
                  _ProductGrid(products: products),
                const SizedBox(height: 22),
                const _SectionHeader(
                  title: 'Today’s market prices',
                  subtitle: 'Live from backend',
                ),
                const SizedBox(height: 12),
                if (snapshot.connectionState == ConnectionState.waiting)
                  const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (snapshot.hasError)
                  _MessageCard(
                    icon: Icons.cloud_off_rounded,
                    text:
                        'Could not load live prices. Check backend and API URL.',
                    action: _reload,
                  )
                else if (prices.isEmpty)
                  const _MessageCard(
                    icon: Icons.price_check_rounded,
                    text: 'No matching live prices found.',
                  )
                else
                  ...prices
                      .take(4)
                      .map(
                        (price) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _PriceCard(price: price),
                        ),
                      ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showSortSheet() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Sort products',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                ),
              ),
              const SizedBox(height: 10),
              ..._SortMode.values.map(
                (mode) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                    _sortMode == mode
                        ? Icons.radio_button_checked_rounded
                        : Icons.radio_button_off_rounded,
                    color: _sortMode == mode ? AppColors.primary : null,
                  ),
                  title: Text(mode.label),
                  onTap: () {
                    setState(() => _sortMode = mode);
                    Navigator.pop(context);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeroDeal extends StatelessWidget {
  const _HeroDeal({required this.onSell});

  final VoidCallback onSell;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: 26,
      blur: 5.5,
      opacity: .18,
      padding: const EdgeInsets.all(18),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: .18),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: .45),
                    ),
                  ),
                  child: const Text(
                    'Farmer store',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Sell crops directly or buy farm essentials.',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 21,
                    height: 1.08,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    FilledButton.icon(
                      onPressed: onSell,
                      icon: const Icon(Icons.add_rounded, size: 18),
                      label: const Text('Sell crop'),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.local_shipping_outlined, size: 18),
                      label: const Text('Orders'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 82,
            height: 82,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.primary.withValues(alpha: .40),
                  AppColors.primaryDark.withValues(alpha: .10),
                ],
              ),
              border: Border.all(color: Colors.white.withValues(alpha: .18)),
            ),
            child: const Icon(
              Icons.storefront_rounded,
              color: AppColors.primary,
              size: 44,
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchAndFilter extends StatelessWidget {
  const _SearchAndFilter({
    required this.onSearch,
    required this.sortMode,
    required this.onSort,
  });

  final ValueChanged<String> onSearch;
  final _SortMode sortMode;
  final VoidCallback onSort;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: TextField(
            onChanged: onSearch,
            decoration: const InputDecoration(
              hintText: 'Search products, crops, inputs',
              prefixIcon: Icon(Icons.search_rounded),
            ),
          ),
        ),
        const SizedBox(width: 10),
        GlassCard(
          borderRadius: 18,
          blur: 5.5,
          opacity: .18,
          child: IconButton(
            tooltip: sortMode.label,
            onPressed: onSort,
            icon: const Icon(Icons.tune_rounded, color: AppColors.primary),
          ),
        ),
      ],
    );
  }
}

class _CategoryChips extends StatelessWidget {
  const _CategoryChips({
    required this.categories,
    required this.selected,
    required this.onSelected,
  });

  final List<String> categories;
  final String selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = categories[index];
          final active = selected == category;
          return ChoiceChip(
            selected: active,
            label: Text(category),
            onSelected: (_) => onSelected(category),
            labelStyle: TextStyle(
              color: active ? const Color(0xFF06251F) : Colors.white,
              fontWeight: FontWeight.w800,
            ),
            selectedColor: AppColors.primary,
            backgroundColor: Colors.white.withValues(alpha: .08),
            side: BorderSide(
              color: active
                  ? AppColors.primary
                  : Colors.white.withValues(alpha: .18),
            ),
          );
        },
      ),
    );
  }
}

class _ProductGrid extends StatelessWidget {
  const _ProductGrid({required this.products});

  final List<_StoreProduct> products;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 560 ? 3 : 2;
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: products.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: columns == 2 ? .70 : .78,
          ),
          itemBuilder: (context, index) =>
              _ProductTile(product: products[index]),
        );
      },
    );
  }
}

class _ProductTile extends StatelessWidget {
  const _ProductTile({required this.product});

  final _StoreProduct product;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: 22,
      blur: 5.5,
      opacity: .18,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    product.accent.withValues(alpha: .34),
                    AppColors.surfaceStrong.withValues(alpha: .34),
                  ],
                ),
                border: Border.all(color: Colors.white.withValues(alpha: .14)),
              ),
              child: Icon(product.icon, color: product.accent, size: 48),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            product.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              height: 1.05,
              fontSize: 15,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            product.seller,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 7),
          Row(
            children: [
              Expanded(
                child: Text(
                  '${product.price.toStringAsFixed(0)} BDT',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                product.unit,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 34,
            child: FilledButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.add_shopping_cart_rounded, size: 16),
              label: const Text('Add'),
              style: FilledButton.styleFrom(
                textStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        Text(
          subtitle,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
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
      borderRadius: 18,
      blur: 5.5,
      opacity: .16,
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: Colors.white.withValues(alpha: .12),
            foregroundColor: AppColors.primary,
            child: Icon(_goodIcon(price.goodCode), size: 26),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  price.goodName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  'BDT ${price.marketPrice.toStringAsFixed(0)}/${price.unit}',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          Icon(trendIcon, color: trendColor, size: 18),
          const SizedBox(width: 4),
          Text(
            '${price.percentageChange >= 0 ? '+' : ''}${price.percentageChange.toStringAsFixed(1)}%',
            style: TextStyle(color: trendColor, fontWeight: FontWeight.w900),
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

class _MessageCard extends StatelessWidget {
  const _MessageCard({required this.icon, required this.text, this.action});

  final IconData icon;
  final String text;
  final Future<void> Function()? action;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: 18,
      blur: 5.5,
      opacity: .16,
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.white.withValues(alpha: .12),
            foregroundColor: AppColors.primary,
            child: Icon(icon),
          ),
          const SizedBox(width: 13),
          Expanded(child: Text(text)),
          if (action != null)
            IconButton(
              onPressed: action,
              icon: const Icon(Icons.refresh_rounded),
            ),
        ],
      ),
    );
  }
}

enum _SortMode { featured, priceLow, priceHigh, name }

extension on _SortMode {
  String get label => switch (this) {
    _SortMode.featured => 'Featured',
    _SortMode.priceLow => 'Price: low to high',
    _SortMode.priceHigh => 'Price: high to low',
    _SortMode.name => 'Name',
  };
}

class _StoreProduct {
  const _StoreProduct({
    required this.name,
    required this.category,
    required this.unit,
    required this.price,
    required this.seller,
    required this.icon,
    required this.accent,
  });

  final String name;
  final String category;
  final String unit;
  final double price;
  final String seller;
  final IconData icon;
  final Color accent;
}
