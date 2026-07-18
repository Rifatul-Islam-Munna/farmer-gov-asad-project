import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../data/datasources/marketplace_api.dart';
import 'seller_ai_tools.dart';

class SellerProductPanel extends StatefulWidget {
  const SellerProductPanel({super.key});

  @override
  State<SellerProductPanel> createState() => _SellerProductPanelState();
}

class _SellerProductPanelState extends State<SellerProductPanel> {
  final _formKey = GlobalKey<FormState>();
  final _api = MarketplaceApi();
  final _category = TextEditingController();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _useCases = TextEditingController();
  final _symptoms = TextEditingController();
  final _safety = TextEditingController();
  final _price = TextEditingController();
  final _stock = TextEditingController(text: '1');
  final _brand = TextEditingController();
  final _model = TextEditingController();
  final _year = TextEditingController();
  final _power = TextEditingController();
  final _rentalRate = TextEditingController();
  String _type = 'sale';
  bool _restricted = false;
  bool _requiresLicense = false;
  bool _saving = false;

  @override
  void dispose() {
    for (final controller in [
      _category,
      _title,
      _description,
      _useCases,
      _symptoms,
      _safety,
      _price,
      _stock,
      _brand,
      _model,
      _year,
      _power,
      _rentalRate,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await _api.createProduct({
        'categoryCode': _category.text.trim(),
        'title': _title.text.trim(),
        'description': _description.text.trim(),
        if (_useCases.text.trim().isNotEmpty)
          'useCases': _useCases.text.trim(),
        if (_symptoms.text.trim().isNotEmpty)
          'symptoms': _symptoms.text.trim(),
        if (_safety.text.trim().isNotEmpty)
          'safetyNotes': _safety.text.trim(),
        'price': double.parse(_price.text.trim()),
        'stock': int.parse(_stock.text.trim()),
        'transactionType': _type,
        if (_type == 'rental')
          'rentalDailyRate': double.parse(_rentalRate.text.trim()),
        if (_brand.text.trim().isNotEmpty)
          'machineryBrand': _brand.text.trim(),
        if (_model.text.trim().isNotEmpty)
          'machineryModel': _model.text.trim(),
        if (_year.text.trim().isNotEmpty)
          'machineryYear': int.parse(_year.text.trim()),
        if (_power.text.trim().isNotEmpty)
          'machineryPowerHp': double.parse(_power.text.trim()),
        'specifications': {
          if (_brand.text.trim().isNotEmpty) 'brand': _brand.text.trim(),
          if (_model.text.trim().isNotEmpty) 'model': _model.text.trim(),
          if (_year.text.trim().isNotEmpty) 'year': int.parse(_year.text),
          if (_power.text.trim().isNotEmpty)
            'powerHp': double.parse(_power.text),
        },
        'restrictedProduct': _restricted,
        'requiresLicense': _requiresLicense,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Product submitted for category and safety review.'),
        ),
      );
      _formKey.currentState!.reset();
      _title.clear();
      _description.clear();
      _useCases.clear();
      _symptoms.clear();
      _safety.clear();
      _price.clear();
      _stock.text = '1';
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  String? _required(String? value) =>
      value?.trim().isEmpty ?? true ? 'Required' : null;

  String? _number(String? value) {
    if (value?.trim().isEmpty ?? true) return 'Required';
    return num.tryParse(value!.trim()) == null ? 'Enter a valid number' : null;
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'General marketplace product',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          const Text(
            'Add complete use cases, symptoms and safety information. Publishing requires admin approval for this category.',
            style: TextStyle(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _category,
            validator: _required,
            decoration: const InputDecoration(
              labelText: 'Approved category code',
              prefixIcon: Icon(Icons.category_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _title,
            validator: _required,
            decoration: const InputDecoration(labelText: 'Product title'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _description,
            validator: _required,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Full description'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _useCases,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Use cases and intended result',
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _symptoms,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Relevant symptoms or conditions',
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _safety,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Safety notes and when not to use',
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _type,
            decoration: const InputDecoration(labelText: 'Offer type'),
            items: const [
              DropdownMenuItem(value: 'sale', child: Text('For sale')),
              DropdownMenuItem(value: 'rental', child: Text('For rent')),
              DropdownMenuItem(value: 'auction', child: Text('Auction')),
            ],
            onChanged: (value) => setState(() => _type = value ?? 'sale'),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _price,
                  validator: _number,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Price (BDT)'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextFormField(
                  controller: _stock,
                  validator: _number,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Stock'),
                ),
              ),
            ],
          ),
          if (_type == 'rental') ...[
            const SizedBox(height: 12),
            TextFormField(
              controller: _rentalRate,
              validator: _number,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Rental rate per day',
              ),
            ),
          ],
          const SizedBox(height: 18),
          const Text(
            'Machinery details (optional)',
            style: TextStyle(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _brand,
                  decoration: const InputDecoration(labelText: 'Brand'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextFormField(
                  controller: _model,
                  decoration: const InputDecoration(labelText: 'Model'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _year,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Year'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextFormField(
                  controller: _power,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Power HP'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SwitchListTile.adaptive(
            contentPadding: EdgeInsets.zero,
            value: _restricted,
            onChanged: (value) => setState(() => _restricted = value),
            title: const Text('Restricted agricultural product'),
          ),
          SwitchListTile.adaptive(
            contentPadding: EdgeInsets.zero,
            value: _requiresLicense,
            onChanged: (value) => setState(() => _requiresLicense = value),
            title: const Text('License/document verification required'),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: _saving ? null : _submit,
            icon: _saving
                ? const SizedBox.square(
                    dimension: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send_rounded),
            label: Text(_saving ? 'Submitting…' : 'Submit for review'),
          ),
          const SizedBox(height: 24),
          const SellerAiTools(),
        ],
      ),
    );
  }
}
