import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../data/seller_inventory_api.dart';

class SellerWorkspace extends StatefulWidget {
  const SellerWorkspace({super.key});

  @override
  State<SellerWorkspace> createState() => _SellerWorkspaceState();
}

class _SellerWorkspaceState extends State<SellerWorkspace> {
  final _shop = TextEditingController();
  final _address = TextEditingController();
  final _lat = TextEditingController();
  final _lng = TextEditingController();
  final _code = TextEditingController(text: 'neem-oil');
  final _stock = TextEditingController();
  final _unit = TextEditingController(text: 'bottle');
  final _price = TextEditingController();
  late Future<List<Map<String, dynamic>>> _inventory;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _inventory = SellerInventoryApi().mine();
  }

  Future<void> _saveLocation() async {
    await _run(() => SellerInventoryApi().updateLocation(
          shopName: _shop.text.trim(),
          address: _address.text.trim(),
          latitude: double.parse(_lat.text),
          longitude: double.parse(_lng.text),
        ));
  }

  Future<void> _saveStock() async {
    await _run(() => SellerInventoryApi().saveItem(
          medicineCode: _code.text.trim(),
          stockQuantity: double.parse(_stock.text),
          unit: _unit.text.trim(),
          price: double.parse(_price.text),
        ));
    setState(() => _inventory = SellerInventoryApi().mine());
  }

  Future<void> _run(Future<void> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Saved successfully.')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const _Header(),
        const SizedBox(height: 16),
        _section('Shop location', Icons.location_on_rounded, [
          _field(_shop, 'Shop name'),
          _field(_address, 'Address'),
          _field(_lat, 'Latitude', number: true),
          _field(_lng, 'Longitude', number: true),
          FilledButton.icon(
            onPressed: _busy ? null : _saveLocation,
            icon: const Icon(Icons.save_rounded),
            label: const Text('Save location'),
          ),
        ]),
        const SizedBox(height: 12),
        _section('Inventory item', Icons.inventory_2_rounded, [
          _field(_code, 'Medicine code'),
          _field(_stock, 'Stock quantity', number: true),
          _field(_unit, 'Unit'),
          _field(_price, 'Price', number: true),
          FilledButton.icon(
            onPressed: _busy ? null : _saveStock,
            icon: const Icon(Icons.add_box_rounded),
            label: const Text('Save stock'),
          ),
        ]),
        const SizedBox(height: 18),
        const Text('Current inventory', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
        FutureBuilder<List<Map<String, dynamic>>>(
          future: _inventory,
          builder: (context, snapshot) {
            final items = snapshot.data ?? const <Map<String, dynamic>>[];
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LinearProgressIndicator();
            }
            if (items.isEmpty) {
              return const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('No inventory items yet.')));
            }
            return Column(
              children: items.map((item) => Card(
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFEAF4E6),
                    foregroundColor: AppColors.primary,
                    child: Icon(Icons.medication_outlined),
                  ),
                  title: Text(item['medicineName']?.toString() ?? 'Product'),
                  subtitle: Text('${item['stockQuantity']} ${item['unit']}'),
                  trailing: Text('BDT ${item['price']}'),
                ),
              )).toList(growable: false),
            );
          },
        ),
      ],
    );
  }

  Widget _section(String title, IconData icon, List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          Row(children: [Icon(icon, color: AppColors.primary), const SizedBox(width: 8), Text(title, style: const TextStyle(fontWeight: FontWeight.w800))]),
          const SizedBox(height: 12),
          ...children.map((child) => Padding(padding: const EdgeInsets.only(bottom: 10), child: child)),
        ]),
      ),
    );
  }

  TextField _field(TextEditingController controller, String label, {bool number = false}) {
    return TextField(
      controller: controller,
      keyboardType: number ? TextInputType.number : TextInputType.text,
      decoration: InputDecoration(labelText: label),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppColors.primaryDark, AppColors.primary]),
        borderRadius: BorderRadius.circular(24),
      ),
      child: const Row(children: [
        Icon(Icons.medical_services_rounded, color: Colors.white, size: 46),
        SizedBox(width: 14),
        Expanded(child: Text('Maintain verified shop location, stock and prices.', style: TextStyle(color: Colors.white, fontSize: 17))),
      ]),
    );
  }
}
