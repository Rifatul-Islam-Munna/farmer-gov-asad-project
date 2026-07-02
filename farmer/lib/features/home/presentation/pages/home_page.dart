import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/storage/session_storage.dart';
import '../../../../core/theme/app_theme.dart';

@RoutePage()
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final session = GetIt.I<SessionStorage>();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, ${session.name}',
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
            Text(
              session.role,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none_rounded),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
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
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Smart farming starts here',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 21,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Identify crop problems, sell goods and follow market prices.',
                        style: TextStyle(
                          color: Color(0xFFE5F4E1),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 12),
                Icon(
                  Icons.agriculture_rounded,
                  size: 58,
                  color: Colors.white,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Main services',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          _ServiceCard(
            icon: Icons.camera_alt_outlined,
            title: 'Check crop or insect',
            description:
                'Take a picture and receive a demo diagnosis with treatment guidance.',
            onTap: () {},
          ),
          const SizedBox(height: 12),
          _ServiceCard(
            icon: Icons.sell_outlined,
            title: 'Sell agricultural goods',
            description:
                'Identify goods, enter quantity and set your minimum price.',
            onTap: () {
              context.tabsRouter.setActiveIndex(2);
            },
          ),
          const SizedBox(height: 12),
          _ServiceCard(
            icon: Icons.trending_up_rounded,
            title: 'Market prices',
            description:
                'See today’s price, yesterday’s price and current market movement.',
            onTap: () {
              context.tabsRouter.setActiveIndex(1);
            },
          ),
          const SizedBox(height: 24),
          const Text(
            'Today’s suggestion',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          const Card(
            child: Padding(
              padding: EdgeInsets.all(18),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    backgroundColor: Color(0xFFEAF4E6),
                    foregroundColor: AppColors.primary,
                    child: Icon(Icons.lightbulb_outline_rounded),
                  ),
                  SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      'Check crops early in the morning and photograph any unusual insects before applying medicine.',
                      style: TextStyle(
                        height: 1.45,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  const _ServiceCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF4E6),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: AppColors.primary, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      description,
                      style: const TextStyle(
                        fontSize: 13,
                        height: 1.35,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded),
            ],
          ),
        ),
      ),
    );
  }
}
