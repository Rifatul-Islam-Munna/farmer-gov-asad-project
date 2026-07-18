import 'package:farmer/core/widgets/glass_card.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../diagnosis/presentation/goods_detection_button.dart';
import '../../data/datasources/marketplace_api.dart';
import '../../data/models/listing.model.dart';

class SellGoodsPanel extends StatefulWidget {
  const SellGoodsPanel({super.key});

  @override
  State<SellGoodsPanel> createState() => _SellGoodsPanelState();
}

class _SellGoodsPanelState extends State<SellGoodsPanel> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController(text: 'Potato');
  final _code = TextEditingController(text: 'potato');
  final _quantity = TextEditingController();
  final _government = TextEditingController();
  final _market = TextEditingController();
  final _minimum = TextEditingController();
  final _address = TextEditingController();
  final _description = TextEditingController();
  final _grade = TextEditingController();
  String _category = 'agriculturalOutput';
  bool _deliveryAvailable = false;
  bool _negotiable = true;
  late Future<List<ListingModel>> _listings;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _listings = MarketplaceApi().myListings();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await MarketplaceApi().createListing({
        'category': _category,
        'transactionType': 'sale',
        'goodCode': _code.text.trim(),
        'goodName': _name.text.trim(),
        'description': _description.text.trim(),
        'quantity': double.parse(_quantity.text),
        'unit': 'kg',
        'governmentPrice': double.parse(_government.text),
        'marketPrice': double.parse(_market.text),
        'minimumPrice': double.parse(_minimum.text),
        'address': _address.text.trim(),
        'grade': _grade.text.trim().isEmpty ? null : _grade.text.trim(),
        'deliveryAvailable': _deliveryAvailable,
        'negotiable': _negotiable,
      });
      setState(() => _listings = MarketplaceApi().myListings());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Listing published successfully.')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
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
              Icon(Icons.add_business_rounded, color: Colors.white, size: 46),
              SizedBox(width: 14),
              Expanded(
                child: Text(
                  'Publish goods with quantity and a fair minimum price.',
                  style: TextStyle(color: Colors.white, fontSize: 17),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        GoodsDetectionButton(
          onDetected: (code, name) {
            setState(() {
              _code.text = code;
              _name.text = name;
            });
          },
        ),
        const SizedBox(height: 10),
        Form(
          key: _formKey,
          child: GlassCard(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _category,
                    decoration: const InputDecoration(
                      labelText: 'Marketplace category',
                      prefixIcon: Icon(Icons.category_outlined),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'agriculturalOutput', child: Text('Agricultural output')),
                      DropdownMenuItem(value: 'livestock', child: Text('Livestock')),
                      DropdownMenuItem(value: 'poultry', child: Text('Poultry')),
                      DropdownMenuItem(value: 'fisheries', child: Text('Fisheries')),
                      DropdownMenuItem(value: 'machinery', child: Text('Machinery')),
                      DropdownMenuItem(value: 'machineryPart', child: Text('Machinery part')),
                      DropdownMenuItem(value: 'seed', child: Text('Seed')),
                      DropdownMenuItem(value: 'fertilizer', child: Text('Fertilizer')),
                      DropdownMenuItem(value: 'pesticide', child: Text('Pesticide')),
                      DropdownMenuItem(value: 'feed', child: Text('Feed')),
                      DropdownMenuItem(value: 'medicine', child: Text('Medicine')),
                      DropdownMenuItem(value: 'equipmentRental', child: Text('Equipment rental')),
                      DropdownMenuItem(value: 'service', child: Text('Service')),
                    ],
                    onChanged: (value) => setState(() => _category = value ?? 'agriculturalOutput'),
                  ),
                  const SizedBox(height: 10),
                  _field(_name, 'Goods name', Icons.eco_rounded),
                  const SizedBox(height: 10),
                  _field(_code, 'Goods code', Icons.qr_code_rounded),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: _description,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      prefixIcon: Icon(Icons.notes_rounded),
                    ),
                  ),
                  const SizedBox(height: 10),
                  _number(_quantity, 'Quantity in kg'),
                  const SizedBox(height: 10),
                  _number(_government, 'Government price'),
                  const SizedBox(height: 10),
                  _number(_market, 'Market price'),
                  const SizedBox(height: 10),
                  _number(_minimum, 'Minimum price'),
                  const SizedBox(height: 10),
                  _field(
                    _address,
                    'Pickup location',
                    Icons.location_on_outlined,
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: _grade,
                    decoration: const InputDecoration(
                      labelText: 'Grade or quality (optional)',
                      prefixIcon: Icon(Icons.verified_outlined),
                    ),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    value: _deliveryAvailable,
                    onChanged: (value) => setState(() => _deliveryAvailable = value),
                    title: const Text('Delivery available'),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    value: _negotiable,
                    onChanged: (value) => setState(() => _negotiable = value),
                    title: const Text('Price negotiable'),
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _saving ? null : _save,
                    icon: const Icon(Icons.publish_rounded),
                    label: Text(_saving ? 'Publishing...' : 'Publish listing'),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'My listings',
          style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
        ),
        FutureBuilder<List<ListingModel>>(
          future: _listings,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            final items = snapshot.data ?? const <ListingModel>[];
            if (items.isEmpty) {
              return const GlassCard(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Text('No listings yet.'),
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
                          child: Icon(Icons.inventory_2_outlined),
                        ),
                        title: Text(item.goodName),
                        subtitle: Text(
                          '${item.availableQuantity.toStringAsFixed(0)} ${item.unit} ? ${item.status}',
                        ),
                        trailing: Text(
                          'BDT ${item.minimumPrice.toStringAsFixed(0)}',
                        ),
                      ),
                    ),
                  )
                  .toList(growable: false),
            );
          },
        ),
      ],
    );
  }

  TextFormField _field(
    TextEditingController controller,
    String label,
    IconData icon,
  ) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
      validator: (value) =>
          value == null || value.trim().isEmpty ? 'Required' : null,
    );
  }

  TextFormField _number(TextEditingController controller, String label) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(labelText: label),
      validator: (value) =>
          double.tryParse(value ?? '') == null ? 'Enter a valid number' : null,
    );
  }
}
