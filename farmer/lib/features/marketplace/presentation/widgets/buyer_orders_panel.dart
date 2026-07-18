import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../data/datasources/marketplace_api.dart';

class BuyerOrdersPanel extends StatefulWidget {
  const BuyerOrdersPanel({super.key});

  @override
  State<BuyerOrdersPanel> createState() => _BuyerOrdersPanelState();
}

class _BuyerOrdersPanelState extends State<BuyerOrdersPanel> {
  final _api = MarketplaceApi();
  List<Map<String, dynamic>> _orders = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await _api.getOrders();
      if (mounted) setState(() => _orders = orders);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _invoice(String orderId) async {
    try {
      final url = await _api.getInvoiceLink(orderId);
      final launched = await launchUrl(
        Uri.parse(url),
        mode: LaunchMode.externalApplication,
      );
      if (!launched) throw Exception('Could not open invoice PDF.');
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      tilePadding: EdgeInsets.zero,
      title: const Text(
        'My marketplace orders',
        style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
      ),
      subtitle: const Text('Tracking, payment status and PDF invoices'),
      children: [
        if (_loading)
          const Padding(
            padding: EdgeInsets.all(20),
            child: CircularProgressIndicator(),
          )
        else if (_error != null)
          GlassCard(
            child: ListTile(
              title: const Text('Could not load orders'),
              subtitle: Text(_error!),
              trailing: IconButton(
                onPressed: _load,
                icon: const Icon(Icons.refresh_rounded),
              ),
            ),
          )
        else if (_orders.isEmpty)
          const Padding(
            padding: EdgeInsets.all(12),
            child: Text('No marketplace orders yet.'),
          )
        else
          ..._orders.map(
            (order) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            order['orderNumber'] as String? ?? 'Order',
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        Text(
                          '${order['total']} ${order['currency'] ?? 'BDT'}',
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Status: ${order['status']} · Payment: ${order['paymentStatus']}',
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                    if (order['trackingNumber'] != null)
                      Text('Tracking: ${order['trackingNumber']}'),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () => _invoice(order['id'] as String),
                      icon: const Icon(Icons.picture_as_pdf_outlined),
                      label: const Text('Open PDF invoice'),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
