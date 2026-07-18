import 'package:flutter/material.dart';

import '../../../../core/widgets/glass_card.dart';
import '../../data/datasources/marketplace_api.dart';

class BulkPurchasePanel extends StatefulWidget {
  const BulkPurchasePanel({super.key});

  @override
  State<BulkPurchasePanel> createState() => _BulkPurchasePanelState();
}

class _BulkPurchasePanelState extends State<BulkPurchasePanel> {
  final _api = MarketplaceApi();
  List<Map<String, dynamic>> _requests = const [];
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
      final requests = await _api.getBulkRequests();
      if (mounted) setState(() => _requests = requests);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _create() async {
    final title = TextEditingController();
    final category = TextEditingController();
    final description = TextEditingController();
    final quantity = TextEditingController();
    final unit = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create bulk purchase request'),
        content: SingleChildScrollView(
          child: Column(
            children: [
              TextField(controller: title, decoration: const InputDecoration(labelText: 'Title')),
              TextField(controller: category, decoration: const InputDecoration(labelText: 'Category code')),
              TextField(controller: description, maxLines: 3, decoration: const InputDecoration(labelText: 'Description')),
              TextField(controller: quantity, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Quantity')),
              TextField(controller: unit, decoration: const InputDecoration(labelText: 'Unit')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Publish')),
        ],
      ),
    );
    if (result == true) {
      await _api.createBulkRequest({
        'title': title.text.trim(),
        'categoryCode': category.text.trim(),
        'description': description.text.trim(),
        'quantity': double.parse(quantity.text.trim()),
        'unit': unit.text.trim(),
      });
      await _load();
    }
    for (final controller in [title, category, description, quantity, unit]) {
      controller.dispose();
    }
  }

  Future<void> _offer(Map<String, dynamic> request) async {
    final price = TextEditingController();
    final quantity = TextEditingController(text: '${request['quantity']}');
    final days = TextEditingController(text: '3');
    final note = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Offer for ${request['title']}'),
        content: SingleChildScrollView(
          child: Column(
            children: [
              TextField(controller: price, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Unit price')),
              TextField(controller: quantity, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Available quantity')),
              TextField(controller: days, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Delivery days')),
              TextField(controller: note, maxLines: 3, decoration: const InputDecoration(labelText: 'Note')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Submit offer')),
        ],
      ),
    );
    if (result == true) {
      await _api.submitBulkOffer(request['id'] as String, {
        'unitPrice': double.parse(price.text.trim()),
        'availableQuantity': double.parse(quantity.text.trim()),
        'unit': request['unit'],
        'deliveryDays': int.parse(days.text.trim()),
        if (note.text.trim().isNotEmpty) 'note': note.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Offer submitted.')));
      }
    }
    for (final controller in [price, quantity, days, note]) {
      controller.dispose();
    }
  }

  Future<void> _details(Map<String, dynamic> request) async {
    final details = await _api.getBulkRequest(request['id'] as String);
    final offers = (details['offers'] as List<dynamic>? ?? const [])
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList(growable: false);
    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(request['title'] as String, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              if (offers.isEmpty) const Text('No seller offers yet.') else ...offers.map((offer) => ListTile(
                title: Text('${offer['unitPrice']} BDT / ${offer['unit']}'),
                subtitle: Text('${offer['availableQuantity']} available · ${offer['deliveryDays']} days'),
                trailing: FilledButton(
                  onPressed: () async {
                    try {
                      await _api.selectBulkOffer(request['id'] as String, offer['id'] as String);
                      if (context.mounted) Navigator.pop(context);
                      await _load();
                    } catch (error) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
                      }
                    }
                  },
                  child: const Text('Select'),
                ),
              )),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      tilePadding: EdgeInsets.zero,
      title: const Text('Bulk purchase requests', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900)),
      subtitle: const Text('Buyers publish quantity needs; sellers compete with offers'),
      trailing: IconButton(onPressed: _create, icon: const Icon(Icons.add_circle_outline)),
      children: [
        if (_loading)
          const Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())
        else if (_error != null)
          GlassCard(child: ListTile(title: const Text('Could not load requests'), subtitle: Text(_error!), trailing: IconButton(onPressed: _load, icon: const Icon(Icons.refresh))))
        else if (_requests.isEmpty)
          const Padding(padding: EdgeInsets.all(12), child: Text('No open bulk requests.'))
        else
          ..._requests.map((request) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: GlassCard(
                  child: ListTile(
                    title: Text(request['title'] as String? ?? 'Bulk request'),
                    subtitle: Text('${request['quantity']} ${request['unit']} · ${request['categoryCode']}'),
                    onTap: () => _details(request),
                    trailing: OutlinedButton(onPressed: () => _offer(request), child: const Text('Offer')),
                  ),
                ),
              )),
      ],
    );
  }
}
