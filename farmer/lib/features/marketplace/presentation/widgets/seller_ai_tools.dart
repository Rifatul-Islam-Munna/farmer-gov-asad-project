import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../data/datasources/marketplace_api.dart';

class SellerAiTools extends StatefulWidget {
  const SellerAiTools({super.key});

  @override
  State<SellerAiTools> createState() => _SellerAiToolsState();
}

class _SellerAiToolsState extends State<SellerAiTools> {
  final _api = MarketplaceApi();
  List<Map<String, dynamic>> _products = const [];
  List<Map<String, dynamic>> _tasks = const [];
  Map<String, dynamic>? _guidance;
  String? _selectedId;
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
      final products = await _api.getSellerProducts();
      final selected = _selectedId ?? (products.isNotEmpty ? products.first['id'] as String : null);
      final tasks = selected == null ? <Map<String, dynamic>>[] : await _api.getAiTasks(productId: selected);
      if (!mounted) return;
      setState(() {
        _products = products;
        _selectedId = selected;
        _tasks = tasks;
      });
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _run(Future<void> Function() action, String message) async {
    try {
      await action();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      await _load();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  Future<void> _price() async {
    if (_selectedId == null) return;
    try {
      final guidance = await _api.getPriceGuidance(_selectedId!);
      if (mounted) setState(() => _guidance = guidance);
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Seller AI and pricing tools', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          const Text('Generated text and edited images are never published automatically. Review and apply each result.', style: TextStyle(color: AppColors.textSecondary)),
          const SizedBox(height: 12),
          if (_loading)
            const Center(child: CircularProgressIndicator())
          else if (_error != null)
            ListTile(title: const Text('Could not load seller tools'), subtitle: Text(_error!), trailing: IconButton(onPressed: _load, icon: const Icon(Icons.refresh)))
          else if (_products.isEmpty)
            const Text('Create a product first to use these tools.')
          else ...[
            DropdownButtonFormField<String>(
              initialValue: _selectedId,
              decoration: const InputDecoration(labelText: 'Product'),
              items: _products.map((product) => DropdownMenuItem(value: product['id'] as String, child: Text(product['title'] as String? ?? 'Product'))).toList(),
              onChanged: (value) async {
                setState(() {
                  _selectedId = value;
                  _guidance = null;
                });
                await _load();
              },
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilledButton.icon(onPressed: () => _run(() async { await _api.requestDescription(_selectedId!); }, 'Description generation queued.'), icon: const Icon(Icons.auto_awesome), label: const Text('Generate description')),
                OutlinedButton.icon(onPressed: () => _run(() async { await _api.requestBackgroundRemoval(_selectedId!); }, 'Background removal queued.'), icon: const Icon(Icons.image_outlined), label: const Text('Remove background')),
                OutlinedButton.icon(onPressed: _price, icon: const Icon(Icons.trending_up), label: const Text('Price guidance')),
              ],
            ),
            if (_guidance != null) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: .08), borderRadius: BorderRadius.circular(12)),
                child: Text('Suggested price: ${_guidance!['suggestedPrice']} BDT\nDemand: ${_guidance!['demandBand']}\nBest months: ${((_guidance!['bestMonths'] as List?) ?? const []).map((item) => (item as Map)['month']).join(', ')}'),
              ),
            ],
            const SizedBox(height: 14),
            const Text('Generated tasks', style: TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            if (_tasks.isEmpty)
              const Text('No generated results yet.', style: TextStyle(color: AppColors.textSecondary))
            else
              ..._tasks.map((task) {
                final output = Map<String, dynamic>.from(task['output'] as Map? ?? const {});
                final completed = task['status'] == 'completed';
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${task['type']} · ${task['status']}', style: const TextStyle(fontWeight: FontWeight.w800)),
                        if (output['description'] != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(output['description'] as String)),
                        if (output['outputUrl'] != null) Padding(padding: const EdgeInsets.only(top: 8), child: Image.network(output['outputUrl'] as String, height: 130, errorBuilder: (_, _, _) => const Text('Edited image preview unavailable.'))),
                        if (task['error'] != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(task['error'] as String, style: const TextStyle(color: Colors.red))),
                        if (completed) Padding(
                          padding: const EdgeInsets.only(top: 10),
                          child: Row(children: [
                            FilledButton(onPressed: () => _run(() => _api.reviewAiTask(task['id'] as String, 'apply'), 'Generated result applied.'), child: const Text('Apply')),
                            const SizedBox(width: 8),
                            OutlinedButton(onPressed: () => _run(() => _api.reviewAiTask(task['id'] as String, 'reject'), 'Generated result rejected.'), child: const Text('Reject')),
                          ]),
                        ),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ],
      ),
    );
  }
}
