import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/glass_card.dart';

@RoutePage()
class PlantsPage extends StatelessWidget {
  const PlantsPage({super.key});

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
                colors: [Color(0xA80A3028), Color(0xF0061713)],
              ),
            ),
          ),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 110),
              children: const [
                Text(
                  'My Plants',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  'Monitor crop health, growth and current issues',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
                SizedBox(height: 18),
                _PlantCard(
                  name: 'Tomato',
                  variety: 'BARI Tomato-15',
                  health: 72,
                  status: 'Needs attention',
                  issue: 'Possible leaf spot detected on 3 leaves',
                  icon: Icons.local_florist_rounded,
                  accent: Color(0xFFFF8A6E),
                ),
                SizedBox(height: 14),
                _PlantCard(
                  name: 'Rice',
                  variety: 'BRRI dhan29',
                  health: 91,
                  status: 'Healthy',
                  issue: 'No active issue detected',
                  icon: Icons.grass_rounded,
                  accent: Color(0xFF66E7BE),
                ),
                SizedBox(height: 14),
                _PlantCard(
                  name: 'Potato',
                  variety: 'Cardinal',
                  health: 64,
                  status: 'Water stress',
                  issue: 'Soil moisture is below recommended level',
                  icon: Icons.eco_rounded,
                  accent: Color(0xFFFFC768),
                ),
                SizedBox(height: 20),
                _SummaryCard(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PlantCard extends StatelessWidget {
  const _PlantCard({
    required this.name,
    required this.variety,
    required this.health,
    required this.status,
    required this.issue,
    required this.icon,
    required this.accent,
  });

  final String name;
  final String variety;
  final int health;
  final String status;
  final String issue;
  final IconData icon;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: 24,
      blur: 28,
      opacity: .14,
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: accent.withValues(alpha: .14),
                  border: Border.all(color: accent.withValues(alpha: .42)),
                  boxShadow: [
                    BoxShadow(
                      color: accent.withValues(alpha: .20),
                      blurRadius: 18,
                    ),
                  ],
                ),
                child: Icon(icon, color: accent, size: 30),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      variety,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '$health%',
                style: TextStyle(
                  color: accent,
                  fontWeight: FontWeight.w900,
                  fontSize: 22,
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: LinearProgressIndicator(
              value: health / 100,
              minHeight: 9,
              backgroundColor: Colors.white.withValues(alpha: .08),
              valueColor: AlwaysStoppedAnimation(accent),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline_rounded, color: accent, size: 20),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      status,
                      style: TextStyle(
                        color: accent,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      issue,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        height: 1.35,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.textSecondary,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: 24,
      blur: 28,
      opacity: .14,
      padding: const EdgeInsets.all(18),
      child: const Row(
        children: [
          Expanded(
            child: _SummaryItem(
              label: 'Healthy',
              value: '1',
              icon: Icons.check_circle_rounded,
              color: Color(0xFF66E7BE),
            ),
          ),
          Expanded(
            child: _SummaryItem(
              label: 'Issues',
              value: '2',
              icon: Icons.warning_amber_rounded,
              color: Color(0xFFFFC768),
            ),
          ),
          Expanded(
            child: _SummaryItem(
              label: 'Scans',
              value: '12',
              icon: Icons.center_focus_strong_rounded,
              color: Color(0xFF72D5FF),
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  const _SummaryItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w900,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
        ),
      ],
    );
  }
}
