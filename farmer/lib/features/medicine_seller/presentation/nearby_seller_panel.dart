import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../data/seller_inventory_api.dart';

class NearbySellerPanel extends StatefulWidget {
  const NearbySellerPanel({required this.medicineCode, super.key});

  final String medicineCode;

  @override
  State<NearbySellerPanel> createState() => _NearbySellerPanelState();
}

class _NearbySellerPanelState extends State<NearbySellerPanel> {
  final _latitude = TextEditingController();
  final _longitude = TextEditingController();
  Future<List<Map<String, dynamic>>>? _results;

  void _search() {
    final latitude = double.tryParse(_latitude.text);
    final longitude = double.tryParse(_longitude.text);
    if (latitude == null || longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter valid latitude and longitude.')),
      );
      return;
    }
    setState(() {
      _results = SellerInventoryApi().nearby(
        latitude: latitude,
        longitude: longitude,
        medicineCode: widget.medicineCode,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.near_me_rounded, color: AppColors.primary),
                SizedBox(width: 8),
                Text(
                  'Find nearby stock',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Searching for: ${widget.medicineCode}'),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _latitude,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Latitude'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _longitude,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Longitude'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            FilledButton.icon(
              onPressed: _search,
              icon: const Icon(Icons.search_rounded),
              label: const Text('Find sellers'),
            ),
            if (_results != null) ...[
              const SizedBox(height: 12),
              FutureBuilder<List<Map<String, dynamic>>>(
                future: _results,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const LinearProgressIndicator();
                  }
                  if (snapshot.hasError) {
                    return Text(snapshot.error.toString());
                  }
                  final items = snapshot.data ?? const <Map<String, dynamic>>[];
                  if (items.isEmpty) {
                    return const Text('No nearby seller currently has this product in stock.');
                  }
                  return Column(
                    children: items
                        .map(
                          (item) => ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFFEAF4E6),
                              foregroundColor: AppColors.primary,
                              child: Icon(Icons.local_pharmacy_outlined),
                            ),
                            title: Text(item['shopName']?.toString() ?? 'Medicine shop'),
                            subtitle: Text(
                              '${item['address']} • ${item['distanceKm']} km\n${item['stockQuantity']} ${item['unit']} available',
                            ),
                            isThreeLine: true,
                            trailing: Text('BDT ${item['price']}'),
                          ),
                        )
                        .toList(growable: false),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
