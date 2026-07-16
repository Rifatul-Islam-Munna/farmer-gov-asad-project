import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../../../core/widgets/glass_card.dart';
import '../widgets/farmer_workspace.dart';

@RoutePage()
class SellProductPage extends StatelessWidget {
  const SellProductPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Sell Product')),
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset('assets/images/plant_leaf.jpg', fit: BoxFit.cover),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xA6082B24), Color(0xF0061713)],
              ),
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 24),
              child: GlassCard(
                borderRadius: 26,
                blur: 10,
                opacity: .14,
                child: const FarmerWorkspace(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
