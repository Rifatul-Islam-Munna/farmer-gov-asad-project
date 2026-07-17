import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';

@RoutePage()
class AlertsPage extends StatelessWidget {
  const AlertsPage({super.key});

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
                colors: [Color(0xA6082B24), Color(0xF0061713)],
              ),
            ),
          ),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 110),
              children: const [
                Text(
                  'AI Farm Alerts',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Weather and crop actions for today',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
                SizedBox(height: 18),
                _AlertCard(
                  icon: Icons.local_fire_department_rounded,
                  color: Color(0xFFFF7966),
                  title: 'Heat Alert',
                  value: '35°C',
                  subtitle:
                      'Water crops before 10 AM and shade young seedlings.',
                ),
                SizedBox(height: 14),
                _AlertCard(
                  icon: Icons.water_drop_rounded,
                  color: Color(0xFF72D5FF),
                  title: 'Flood Alert',
                  value: '60% risk',
                  subtitle:
                      'Delay pesticide spraying and clear drainage channels.',
                ),
                SizedBox(height: 14),
                _AlertCard(
                  icon: Icons.coronavirus_rounded,
                  color: Color(0xFF6FF0C9),
                  title: 'Disease Detection',
                  value: 'High humidity',
                  subtitle: 'Inspect tomato leaves and scan any fresh spots.',
                ),
                SizedBox(height: 14),
                _AlertCard(
                  icon: Icons.air_rounded,
                  color: Color(0xFFFFCB67),
                  title: 'Wind Advisory',
                  value: '18 km/h',
                  subtitle:
                      'Avoid spraying during strong wind to prevent drift.',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AlertCard extends StatelessWidget {
  const _AlertCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.value,
    required this.subtitle,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String value;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: 24,
      blur: 5.5,
      opacity: .14,
      padding: const EdgeInsets.all(18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color.withValues(alpha: .16),
              border: Border.all(color: color.withValues(alpha: .42)),
              boxShadow: [
                BoxShadow(color: color.withValues(alpha: .24), blurRadius: 22),
              ],
            ),
            child: Icon(icon, color: color, size: 29),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: TextStyle(color: color, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
