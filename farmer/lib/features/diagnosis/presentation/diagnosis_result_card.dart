import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../medicine_seller/presentation/nearby_seller_panel.dart';

class DiagnosisResultCard extends StatelessWidget {
  const DiagnosisResultCard({required this.result, super.key});

  final Map<String, dynamic> result;

  @override
  Widget build(BuildContext context) {
    final diagnosis = Map<String, dynamic>.from(result['diagnosis'] as Map);
    final treatment = Map<String, dynamic>.from(result['treatment'] as Map);
    final medicineCodes = treatment['medicineCodes'] as List? ?? const [];

    return Column(
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.bug_report_rounded,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        diagnosis['name']?.toString() ?? 'Detected issue',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    Text(
                      '${((diagnosis['confidence'] as num? ?? 0) * 100).toStringAsFixed(0)}%',
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Risk: ${diagnosis['risk']}'),
                const SizedBox(height: 10),
                _items('Symptoms', diagnosis['symptoms']),
              ],
            ),
          ),
        ),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Treatment and safety',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                _items('Steps', treatment['steps']),
                const SizedBox(height: 8),
                _items('Safety', treatment['safety']),
                const SizedBox(height: 8),
                Text('Suggested products: ${medicineCodes.join(', ')}'),
              ],
            ),
          ),
        ),
        if (medicineCodes.isNotEmpty)
          NearbySellerPanel(medicineCode: medicineCodes.first.toString()),
        const SizedBox(height: 10),
        const Text(
          'Demo result: the provider can be replaced later without changing this screen.',
          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _items(String title, Object? raw) {
    final items = raw as List? ?? const [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text('• $item'),
          ),
        ),
      ],
    );
  }
}
