import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../../core/widgets/glass_card.dart';
import 'crop_diagnosis_panel.dart';

@RoutePage()
class ScannerPage extends StatelessWidget {
  const ScannerPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset('assets/images/plant_leaf.jpg', fit: BoxFit.cover),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0x61082B24), Color(0xB8061A16)],
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 104),
              child: GlassCard(
                borderRadius: 28,
                blur: 9,
                opacity: .10,
                child: const CropDiagnosisPanel(embedded: true),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
