import 'package:farmer/core/utils/app_toast.dart';
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
  final _address = TextEditingController();
  final _minPrice = TextEditingController();
  final _maxPrice = TextEditingController();
  final _minQuantity = TextEditingController();
  late Future<ListingPage> _listings;
  String? _category;
  String _sortBy = 'newest';
  bool? _deliveryAvailable;
  bool? _negotiable;
  int _page = 1;

  static const categories = <String, String>{
    'All categories': '',
    'Farm output': 'agriculturalOutput',
    'Livestock': 'livestock',
    'Poultry': 'poultry',
    'Fisheries': 'fisheries',
    'Machinery': 'machinery',
    'Parts': 'machineryPart',
    'Seeds': 'seed',
    'Fertilizer': 'fertilizer',
    'Pesticide': 'pesticide',
    'Feed': 'feed',
    'Medicine': 'medicine',
    'Equipment rental': 'equipmentRental',
    'Services': 'service',
  };

  @override
  void initState() {
    super.initState();
    _listings = _load();
  }

  @override
  void dispose() {
    _search.dispose();
    _address.dispose();
    _minPrice.dispose();
    _maxPrice.dispose();
    _minQuantity.dispose();
    super.dispose();
  }

  Future<ListingPage> _load() => MarketplaceApi().searchListings(
        search: _search.text,
        category: _category,
        address: _address.text,
        minimumPrice: double.tryParse(_minPrice.text),
        maximumPrice: double.tryParse(_maxPrice.text),
        minimumQuantity: double.tryParse(_minQuantity.text),
        deliveryAvailable: _deliveryAvailable,
        negotiable: _negotiable,
        sortBy: _sortBy,
        page: _page,
      );

  void _reload({int page = 1}) {
    setState(() {
      _page = page;
      _listings = _load();
    });
  }

  Future<void> _offer(ListingModel listing) async {
    final quantity = TextEditingController();
    final price = TextEditingController(text: listing.minimumPrice.toStringAsFixed(0));
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
              decoration: InputDecoration(labelText: 'Quantity (${listing.unit})'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: price,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Unit price'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Submit offer')),
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
      AppToast.success('Offer sent to the farmer.');
    } catch (_) {
      AppToast.error('Could not submit the offer. Check quantity and price.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Farmer marketplace', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
        const SizedBox(height: 10),
        TextField(
          controller: _search,
          onSubmitted: (_) => _reload(),
          decoration: InputDecoration(
            hintText: 'Search crops, machinery, inputs or sellers',
            prefixIcon: const Icon(Icons.search_rounded),
            suffixIcon: IconButton(onPressed: _showFilters, icon: const Icon(Icons.tune_rounded)),
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (_category != null) _FilterChip(label: categories.entries.firstWhere((e) => e.value == _category).key, onClear: () { _category = null; _reload(); }),
            if (_address.text.isNotEmpty) _FilterChip(label: _address.text, onClear: () { _address.clear(); _reload(); }),
            if (_deliveryAvailable == true) _FilterChip(label: 'Delivery', onClear: () { _deliveryAvailable = null; _reload(); }),
            if (_negotiable == true) _FilterChip(label: 'Negotiable', onClear: () { _negotiable = null; _reload(); }),
          ],
        ),
        const SizedBox(height: 10),
        FutureBuilder<ListingPage>(
          future: _listings,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) return const LinearProgressIndicator();
            if (snapshot.hasError) {
              return GlassCard(child: Padding(padding: const EdgeInsets.all(18), child: Text(snapshot.error.toString())));
            }
            final page = snapshot.data!;
            if (page.items.isEmpty) {
              return const GlassCard(child: Padding(padding: EdgeInsets.all(18), child: Text('No matching listings found.')));
            }
            return Column(
              children: [
                ...page.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: const Color(0xFFEAF4E6),
                                    foregroundColor: AppColors.primary,
                                    child: Icon(_categoryIcon(item.category)),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(item.goodName, style: const TextStyle(fontWeight: FontWeight.w800)),
                                        Text('${item.availableQuantity.toStringAsFixed(0)} ${item.unit} • ${item.address ?? 'Location not set'}'),
                                      ],
                                    ),
                                  ),
                                  FilledButton(onPressed: () => _offer(item), child: const Text('Offer')),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Wrap(
                                spacing: 7,
                                runSpacing: 7,
                                children: [
                                  _Tag(item.category),
                                  _Tag('BDT ${item.minimumPrice.toStringAsFixed(0)}'),
                                  if (item.grade != null) _Tag(item.grade!),
                                  if (item.deliveryAvailable) const _Tag('Delivery'),
                                  if (item.negotiable) const _Tag('Negotiable'),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    )),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    OutlinedButton.icon(
                      onPressed: page.page > 1 ? () => _reload(page: page.page - 1) : null,
                      icon: const Icon(Icons.chevron_left_rounded),
                      label: const Text('Previous'),
                    ),
                    Text('Page ${page.page} of ${page.totalPages} • ${page.total} listings'),
                    FilledButton.icon(
                      onPressed: page.hasNextPage ? () => _reload(page: page.page + 1) : null,
                      iconAlignment: IconAlignment.end,
                      icon: const Icon(Icons.chevron_right_rounded),
                      label: const Text('Next'),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Future<void> _showFilters() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(18, 0, 18, MediaQuery.viewInsetsOf(context).bottom + 20),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  initialValue: _category ?? '',
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: categories.entries.map((entry) => DropdownMenuItem(value: entry.value, child: Text(entry.key))).toList(),
                  onChanged: (value) => setSheetState(() => _category = value?.isEmpty == true ? null : value),
                ),
                const SizedBox(height: 10),
                TextField(controller: _address, decoration: const InputDecoration(labelText: 'District or location')),
                const SizedBox(height: 10),
                Row(children: [
                  Expanded(child: TextField(controller: _minPrice, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Minimum price'))),
                  const SizedBox(width: 10),
                  Expanded(child: TextField(controller: _maxPrice, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Maximum price'))),
                ]),
                const SizedBox(height: 10),
                TextField(controller: _minQuantity, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Minimum available quantity')),
                SwitchListTile(value: _deliveryAvailable == true, onChanged: (value) => setSheetState(() => _deliveryAvailable = value ? true : null), title: const Text('Delivery available')),
                SwitchListTile(value: _negotiable == true, onChanged: (value) => setSheetState(() => _negotiable = value ? true : null), title: const Text('Negotiable only')),
                DropdownButtonFormField<String>(
                  initialValue: _sortBy,
                  decoration: const InputDecoration(labelText: 'Sort by'),
                  items: const [
                    DropdownMenuItem(value: 'newest', child: Text('Newest')),
                    DropdownMenuItem(value: 'priceLow', child: Text('Price: low to high')),
                    DropdownMenuItem(value: 'priceHigh', child: Text('Price: high to low')),
                    DropdownMenuItem(value: 'quantityHigh', child: Text('Available quantity')),
                  ],
                  onChanged: (value) => setSheetState(() => _sortBy = value ?? 'newest'),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () {
                      Navigator.pop(context);
                      _reload();
                    },
                    child: const Text('Apply filters'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _categoryIcon(String category) => switch (category) {
        'machinery' || 'equipmentRental' => Icons.agriculture_rounded,
        'livestock' => Icons.pets_rounded,
        'poultry' => Icons.egg_alt_rounded,
        'fisheries' => Icons.set_meal_rounded,
        'seed' || 'fertilizer' || 'pesticide' || 'feed' => Icons.inventory_2_rounded,
        _ => Icons.eco_rounded,
      };
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label, required this.onClear});
  final String label;
  final VoidCallback onClear;
  @override
  Widget build(BuildContext context) => InputChip(label: Text(label), onDeleted: onClear);
}

class _Tag extends StatelessWidget {
  const _Tag(this.label);
  final String label;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: .10), borderRadius: BorderRadius.circular(99)),
        child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
      );
}
