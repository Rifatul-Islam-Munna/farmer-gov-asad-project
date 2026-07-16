import 'package:farmer/core/widgets/glass_card.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../data/datasources/marketplace_api.dart';
import '../../data/models/negotiation.model.dart';

class BuyerDealsPanel extends StatefulWidget {
  const BuyerDealsPanel({super.key});

  @override
  State<BuyerDealsPanel> createState() => _BuyerDealsPanelState();
}

class _BuyerDealsPanelState extends State<BuyerDealsPanel> {
  late Future<List<NegotiationModel>> _offers;
  late Future<List<Map<String, dynamic>>> _deals;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _offers = MarketplaceApi().myOffers();
    _deals = MarketplaceApi().myDeals();
  }

  Future<void> _accept(String id) async {
    await MarketplaceApi().acceptOffer(id);
    setState(_reload);
  }

  Future<void> _reject(String id) async {
    await MarketplaceApi().rejectOffer(id);
    setState(_reload);
  }

  Future<void> _counter(NegotiationModel offer) async {
    final quantity = TextEditingController(text: offer.quantity.toString());
    final price = TextEditingController(text: offer.unitPrice.toString());
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Counteroffer'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: quantity,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Quantity',
                prefixIcon: Icon(Icons.scale_rounded),
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
            child: const Text('Send counteroffer'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    await MarketplaceApi().counterOffer(
      id: offer.id,
      quantity: double.parse(quantity.text),
      unitPrice: double.parse(price.text),
    );
    setState(_reload);
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => setState(_reload),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryDark, AppColors.primary],
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Row(
              children: [
                Icon(Icons.handshake_rounded, size: 48, color: Colors.white),
                SizedBox(width: 14),
                Expanded(
                  child: Text(
                    'Review negotiations and confirm matching quantity and price.',
                    style: TextStyle(color: Colors.white, fontSize: 17),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'My offers',
            style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
          ),
          FutureBuilder<List<NegotiationModel>>(
            future: _offers,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Padding(
                  padding: EdgeInsets.all(20),
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              final items = snapshot.data ?? const <NegotiationModel>[];
              if (items.isEmpty) {
                return const GlassCard(
                  child: Padding(
                    padding: EdgeInsets.all(18),
                    child: Text('No offers yet. Browse listings from Market.'),
                  ),
                );
              }
              return Column(
                children: items
                    .map(
                      (item) => GlassCard(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            children: [
                              ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const CircleAvatar(
                                  backgroundColor: Color(0xFFEAF4E6),
                                  foregroundColor: AppColors.primary,
                                  child: Icon(Icons.request_quote_rounded),
                                ),
                                title: Text(
                                  '${item.quantity.toStringAsFixed(0)} units â€¢ BDT ${item.unitPrice.toStringAsFixed(0)}',
                                ),
                                subtitle: Text(item.status),
                              ),
                              if (![
                                'confirmed',
                                'rejected',
                                'cancelled',
                              ].contains(item.status))
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: [
                                    OutlinedButton.icon(
                                      onPressed: () => _reject(item.id),
                                      icon: const Icon(Icons.close_rounded),
                                      label: const Text('Reject'),
                                    ),
                                    OutlinedButton.icon(
                                      onPressed: () => _counter(item),
                                      icon: const Icon(Icons.sync_alt_rounded),
                                      label: const Text('Counter'),
                                    ),
                                    FilledButton.icon(
                                      onPressed: () => _accept(item.id),
                                      icon: const Icon(Icons.check_rounded),
                                      label: const Text('Accept'),
                                    ),
                                  ],
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
          const SizedBox(height: 20),
          const Text(
            'Confirmed deals',
            style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
          ),
          FutureBuilder<List<Map<String, dynamic>>>(
            future: _deals,
            builder: (context, snapshot) {
              final items = snapshot.data ?? const <Map<String, dynamic>>[];
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const LinearProgressIndicator();
              }
              if (items.isEmpty) {
                return const GlassCard(
                  child: Padding(
                    padding: EdgeInsets.all(18),
                    child: Text('No confirmed deals yet.'),
                  ),
                );
              }
              return Column(
                children: items
                    .map(
                      (item) => GlassCard(
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0xFFEAF4E6),
                            foregroundColor: AppColors.primary,
                            child: Icon(Icons.verified_rounded),
                          ),
                          title: Text('BDT ${item['totalPrice']}'),
                          subtitle: Text(
                            '${item['quantity']} units â€¢ ${item['status']}',
                          ),
                        ),
                      ),
                    )
                    .toList(growable: false),
              );
            },
          ),
        ],
      ),
    );
  }
}
