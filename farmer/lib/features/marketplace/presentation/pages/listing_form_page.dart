import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';

@RoutePage()
class ListingFormPage extends StatefulWidget {
  const ListingFormPage({super.key});

  @override
  State<ListingFormPage> createState() => _ListingFormPageState();
}

class _ListingFormPageState extends State<ListingFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _goodController = TextEditingController();
  final _quantityController = TextEditingController();
  final _minimumPriceController = TextEditingController();

  @override
  void dispose() {
    _goodController.dispose();
    _quantityController.dispose();
    _minimumPriceController.dispose();
    super.dispose();
  }

  void _submitDemo() {
    if (!_formKey.currentState!.validate()) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Demo listing is ready. The listing API comes next.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sell goods')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFFEAF4E6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                children: [
                  Icon(
                    Icons.camera_alt_outlined,
                    color: AppColors.primary,
                    size: 34,
                  ),
                  SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      'Take a picture to identify the good. This uses a demo result for now.',
                    style: TextStyle(
                      height: 1.4,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            OutlinedButton.icon(
              onPressed: () {
                _goodController.text = 'Potato';
                setState(() {});
              },
              icon: const Icon(Icons.photo_camera_outlined),
              label: const Text('Demo identify from picture'),
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _goodController,
              decoration: const InputDecoration(
                labelText: 'What are you selling?',
                prefixIcon: Icon(Icons.search_rounded),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Select or enter a good';
                }
                return null;
              },
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _quantityController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelTex: 'Available quantity (kg)',
                prefixIcon: Icon(Icons.scale_outlined),
              ),
              validator: (value) {
                final quantity = double.tryParse(value?.trim() ?? '');
                if (quantity == null || quantity <= 0) {
                  return 'Enter a valid quantity';
                }
                return null;
              },
            ),
            const SizedBox(height: 14),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Color(0xFFEAF4E6),
                      foregroundColor: AppColors.primary,
                      child: Icon(Icons.account_balance_outlined),
                    ),
                    SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Government reference price',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                          SizedBox(height: 4),
                          Text(
                            '§ 38/kg — demo value',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                     ),
                  ),
                ],
              ),
            ),
           ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _minimumPriceController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Minimum price per kg',
                prefixIcon: Icon(Icons.payments_outlined),
              ),
              validator: (value) {
                final price = double.tryParse(value?.trim() ?? '');
                if (price == null || price <= 0) {
                  return 'Enter a valid minimum price';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _submitDemo,
              icon: const Icon(Icons.publish_rounded),
              label: const Text('Review demo listing'),
            ),
          ],
        ),
      ),
    );
  }
}
