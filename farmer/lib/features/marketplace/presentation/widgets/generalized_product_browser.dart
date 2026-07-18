import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../data/datasources/marketplace_api.dart';
import 'ephemeral_chat_sheet.dart';

class GeneralizedProductBrowser extends StatefulWidget {
  GeneralizedProductBrowser({super.key, MarketplaceApi? api})
    : api = api ?? MarketplaceApi();

  final MarketplaceApi api;

  @override
  State<GeneralizedProductBrowser> createState() =>
      _GeneralizedProductBrowserState();
}

class _GeneralizedProductBrowserState extends State<GeneralizedProductBrowser> {
  late final MarketplaceApi _api = widget.api;
  final _search = TextEditingController();
  final _speech = SpeechToText();
  List<Map<String, dynamic>> _items = const [];
  bool _loading = true;
  bool _listening = false;
  String? _error;
  String _type = '';
  Set<String> _favoriteIds = <String>{};

  @override
  void initState() {
    super.initState();
    _load();
    _refreshFavorites();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load({bool voice = false}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final query = _search.text.trim();
      final items = voice && query.isNotEmpty
          ? await _api.voiceSearch(query)
          : await _api.searchProducts(
              query: query,
              transactionType: _type.isEmpty ? null : _type,
            );
      if (mounted) setState(() => _items = items);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _refreshFavorites() async {
    try {
      final favorites = await _api.getFavorites();
      if (!mounted) return;
      setState(() {
        _favoriteIds = favorites
            .map(
              (item) =>
                  item['productId'] as String? ??
                  (item['product'] as Map?)?['id'] as String?,
            )
            .whereType<String>()
            .toSet();
      });
    } catch (_) {
      // Product browsing remains usable for signed-out users.
    }
  }

  Future<void> _toggleFavorite(Map<String, dynamic> item) async {
    await _action(
      () async {
        await _api.toggleFavorite(item['id'] as String);
        await _refreshFavorites();
      },
      _favoriteIds.contains(item['id'])
          ? 'Removed from favorites.'
          : 'Added to favorites.',
    );
  }

  Future<void> _saveCurrentSearch() async {
    final controller = TextEditingController(
      text: _search.text.trim().isEmpty
          ? 'Marketplace search'
          : _search.text.trim(),
    );
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Save search'),
        content: TextField(controller: controller, autofocus: true),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (name == null || name.isEmpty) return;
    await _action(
      () => _api.saveSearch(
        name: name,
        query: _search.text.trim(),
        transactionType: _type.isEmpty ? null : _type,
      ),
      'Search saved.',
    );
  }

  Future<void> _showSaved() async {
    final results = await Future.wait([
      _api.getFavorites(),
      _api.getSavedSearches(),
    ]);
    if (!mounted) return;
    final favorites = results[0];
    final searches = results[1];
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, setSheetState) => DraggableScrollableSheet(
          expand: false,
          initialChildSize: .82,
          builder: (context, scrollController) => ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(18),
            children: [
              const Text(
                'Saved marketplace',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 16),
              const Text(
                'Favorites',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
              if (favorites.isEmpty)
                const ListTile(title: Text('No favorites yet.')),
              ...favorites.map((favorite) {
                final product = Map<String, dynamic>.from(
                  favorite['product'] as Map? ?? const {},
                );
                return ListTile(
                  title: Text(product['title'] as String? ?? 'Product'),
                  subtitle: Text(
                    '${product['price'] ?? '-'} ${product['currency'] ?? 'BDT'}',
                  ),
                  trailing: IconButton(
                    tooltip: 'Remove favorite',
                    icon: const Icon(Icons.delete_outline_rounded),
                    onPressed: () async {
                      await _api.toggleFavorite(
                        favorite['productId'] as String,
                      );
                      favorites.remove(favorite);
                      await _refreshFavorites();
                      setSheetState(() {});
                    },
                  ),
                );
              }),
              const Divider(),
              const Text(
                'Saved searches',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
              if (searches.isEmpty)
                const ListTile(title: Text('No saved searches yet.')),
              ...searches.map(
                (saved) => ListTile(
                  title: Text(saved['name'] as String? ?? 'Saved search'),
                  subtitle: Text(saved['query'] as String? ?? ''),
                  onTap: () {
                    final filters = Map<String, dynamic>.from(
                      saved['filters'] as Map? ?? const {},
                    );
                    _search.text = saved['query'] as String? ?? '';
                    setState(
                      () => _type = filters['transactionType'] as String? ?? '',
                    );
                    Navigator.pop(sheetContext);
                    _load();
                  },
                  trailing: IconButton(
                    tooltip: 'Delete saved search',
                    icon: const Icon(Icons.delete_outline_rounded),
                    onPressed: () async {
                      await _api.deleteSavedSearch(saved['id'] as String);
                      searches.remove(saved);
                      setSheetState(() {});
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _voice() async {
    if (_listening) {
      await _speech.stop();
      setState(() => _listening = false);
      await _load(voice: true);
      return;
    }
    final available = await _speech.initialize(
      onError: (_) => mounted
          ? setState(() {
              _listening = false;
              _error = 'Could not understand the voice search.';
            })
          : null,
      onStatus: (status) {
        if (mounted && status == 'done') {
          setState(() => _listening = false);
          _load(voice: true);
        }
      },
    );
    if (!available) {
      setState(() => _error = 'Voice search is unavailable on this device.');
      return;
    }
    setState(() => _listening = true);
    await _speech.listen(
      listenOptions: SpeechListenOptions(localeId: 'bn_BD'),
      onResult: (result) {
        _search.text = result.recognizedWords;
        _search.selection = TextSelection.collapsed(
          offset: _search.text.length,
        );
      },
    );
  }

  Future<void> _action(Future<void> Function() action, String success) async {
    try {
      await action();
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(success)));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  Future<void> _chat(Map<String, dynamic> item) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => EphemeralChatSheet(
        receiverId: item['sellerId'] as String,
        productId: item['id'] as String,
        productTitle: item['title'] as String? ?? 'Product chat',
      ),
    );
  }

  Future<void> _rent(Map<String, dynamic> item) async {
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (range == null) return;
    await _action(
      () => _api.bookRental(
        productId: item['id'] as String,
        startsAt: range.start,
        endsAt: range.end.add(const Duration(days: 1)),
      ),
      'Rental request submitted.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Products, machinery and rentals',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            OutlinedButton.icon(
              onPressed: _showSaved,
              icon: const Icon(Icons.favorite_rounded),
              label: const Text('Saved'),
            ),
            const SizedBox(width: 8),
            OutlinedButton.icon(
              onPressed: _saveCurrentSearch,
              icon: const Icon(Icons.bookmark_add_outlined),
              label: const Text('Save search'),
            ),
          ],
        ),
        const SizedBox(height: 10),
        GlassCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            children: [
              TextField(
                controller: _search,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => _load(),
                decoration: InputDecoration(
                  hintText: 'বাংলায় সমস্যা বলুন বা পণ্য খুঁজুন',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: IconButton(
                    tooltip: 'Bangla voice search',
                    onPressed: _voice,
                    icon: Icon(
                      _listening ? Icons.stop_circle : Icons.mic_rounded,
                      color: _listening ? Colors.red : AppColors.primary,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: '', label: Text('All')),
                  ButtonSegment(value: 'sale', label: Text('Buy')),
                  ButtonSegment(value: 'rental', label: Text('Rent')),
                  ButtonSegment(value: 'auction', label: Text('Auction')),
                ],
                selected: {_type},
                onSelectionChanged: (value) {
                  setState(() => _type = value.first);
                  _load();
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (_loading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: CircularProgressIndicator(),
            ),
          )
        else if (_error != null)
          GlassCard(
            child: ListTile(
              leading: const Icon(Icons.error_outline_rounded),
              title: const Text('Could not load products'),
              subtitle: Text(_error!),
              trailing: IconButton(
                onPressed: _load,
                icon: const Icon(Icons.refresh_rounded),
              ),
            ),
          )
        else if (_items.isEmpty)
          const GlassCard(
            child: Padding(
              padding: EdgeInsets.all(18),
              child: Text('No matching products found.'),
            ),
          )
        else
          ..._items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _ProductCard(
                item: item,
                isFavorite: _favoriteIds.contains(item['id']),
                favorite: () => _toggleFavorite(item),
                chat: () {
                  _chat(item);
                },
                primary: () {
                  final type = item['transactionType'] as String? ?? 'sale';
                  if (type == 'rental') {
                    _rent(item);
                    return;
                  }
                  if (type == 'auction') {
                    _action(() async {
                      final auctions = await _api.getAuctions();
                      final auction = auctions
                          .cast<Map<String, dynamic>?>()
                          .firstWhere(
                            (auction) => auction?['productId'] == item['id'],
                            orElse: () => null,
                          );
                      if (auction == null) {
                        throw Exception('Auction is not open.');
                      }
                      await _api.placeBid(
                        auction['id'] as String,
                        ((auction['highestBid'] as num?)?.toDouble() ??
                                (auction['startingPrice'] as num).toDouble()) +
                            1,
                      );
                    }, 'Bid placed.');
                    return;
                  }
                  _action(
                    () => _api.addToCart(item['id'] as String),
                    'Added to cart.',
                  );
                },
              ),
            ),
          ),
      ],
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({
    required this.item,
    required this.favorite,
    required this.isFavorite,
    required this.chat,
    required this.primary,
  });

  final Map<String, dynamic> item;
  final VoidCallback favorite;
  final bool isFavorite;
  final VoidCallback chat;
  final VoidCallback primary;

  @override
  Widget build(BuildContext context) {
    final type = item['transactionType'] as String? ?? 'sale';
    final price = type == 'rental'
        ? item['rentalDailyRate'] as num?
        : item['price'] as num?;
    final images = item['imageUrls'] as List<dynamic>? ?? const [];
    return GlassCard(
      padding: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (images.isNotEmpty)
            Image.network(
              images.first as String,
              height: 170,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => const SizedBox(height: 80),
            ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        item['title'] as String? ?? 'Product',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: favorite,
                      icon: Icon(
                        isFavorite
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                      ),
                    ),
                  ],
                ),
                Text(
                  '${item['categoryCode']} · $type',
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 7),
                Text(
                  item['description'] as String? ?? '',
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${price?.toStringAsFixed(0) ?? '-'} ${item['currency'] ?? 'BDT'}${type == 'rental' ? '/day' : ''}',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w900,
                          fontSize: 17,
                        ),
                      ),
                    ),
                    IconButton(
                      tooltip: 'Live chat · not saved',
                      onPressed: chat,
                      icon: const Icon(Icons.chat_bubble_outline_rounded),
                    ),
                    FilledButton(
                      onPressed: primary,
                      child: Text(
                        type == 'rental'
                            ? 'Rent'
                            : type == 'auction'
                            ? 'Bid'
                            : 'Add',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
