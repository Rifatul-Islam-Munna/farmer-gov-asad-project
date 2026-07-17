import 'package:farmer/core/widgets/glass_card.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/location/device_location_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/data/datasources/profile_api.dart';
import '../data/nearby_seller.model.dart';
import '../data/nearby_seller_api.dart';

class NearbySellersPanel extends StatefulWidget {
  const NearbySellersPanel({super.key});

  @override
  State<NearbySellersPanel> createState() => _NearbySellersPanelState();
}

class _NearbySellersPanelState extends State<NearbySellersPanel> {
  final _search = TextEditingController();
  List<NearbyShopModel> _shops = const [];
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _findSellers());
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _findSellers() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final position = await DeviceLocationService.currentPosition();
      await ProfileApi().updateLocation(
        latitude: position.latitude,
        longitude: position.longitude,
      );
      final shops = await NearbySellerApi().findNearby(search: _search.text);
      if (!mounted) return;
      setState(() => _shops = shops);
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = error.toString().replaceFirst('Bad state: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _call(String phoneNumber) async {
    if (phoneNumber.trim().isEmpty) return;
    final uri = Uri(scheme: 'tel', path: phoneNumber.trim());
    if (!await launchUrl(uri)) {
      throw StateError('Could not open the phone dialer.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nearby medicine sellers'),
        leading: IconButton(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.close_rounded),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _search,
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => _findSellers(),
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.search_rounded),
                      labelText: 'Medicine, pesticide or shop',
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                FilledButton.icon(
                  onPressed: _loading ? null : _findSellers,
                  icon: const Icon(Icons.my_location_rounded),
                  label: const Text('Find'),
                ),
              ],
            ),
          ),
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Expanded(child: _content()),
        ],
      ),
    );
  }

  Widget _content() {
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.location_off_rounded, size: 54),
              const SizedBox(height: 12),
              Text(_error!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _findSellers,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Try again'),
              ),
            ],
          ),
        ),
      );
    }
    if (!_loading && _shops.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'No nearby shop currently has matching stock. Try another search.',
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _findSellers,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 28),
        itemCount: _shops.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (_, index) => _ShopCard(
          shop: _shops[index],
          onCall: () => _call(_shops[index].phoneNumber),
        ),
      ),
    );
  }
}

class _ShopCard extends StatelessWidget {
  const _ShopCard({required this.shop, required this.onCall});

  final NearbyShopModel shop;
  final VoidCallback onCall;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const CircleAvatar(
                  backgroundColor: Color(0xFFEAF4E6),
                  foregroundColor: AppColors.primary,
                  child: Icon(Icons.local_pharmacy_rounded),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        shop.shopName,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        '${shop.distanceKm.toStringAsFixed(1)} km away ? ${shop.address}',
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: shop.phoneNumber.isEmpty ? null : onCall,
                  tooltip: 'Call shop',
                  icon: const Icon(Icons.call_rounded),
                ),
              ],
            ),
            const Divider(height: 24),
            ...shop.medicines.map(
              (medicine) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            medicine.medicineName,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                          Text(
                            '${medicine.stockQuantity.toStringAsFixed(0)} ${medicine.unit} available',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      'BDT ${medicine.price.toStringAsFixed(0)}/${medicine.unit}',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (shop.phoneNumber.isNotEmpty)
              Text(
                'Phone: ${shop.phoneNumber}',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
          ],
        ),
      ),
    );
  }
}
