import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/storage/session_storage.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../diagnosis/presentation/crop_diagnosis_panel.dart';
import '../../../medicine_sellers/presentation/nearby_sellers_panel.dart';
import '../role_home_content.dart';

@RoutePage()
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final session = GetIt.I<SessionStorage>();
    final content = RoleHomeContent.forRole(session.role);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          const Positioned.fill(child: _FarmBackground()),
          SafeArea(
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(18, 10, 18, 120),
                  sliver: SliverList.list(
                    children: [
                      _Header(
                        name: session.name,
                        role: content.label,
                        onProfile: () =>
                            context.router.push(const ProfileRoute()),
                      ),
                      const SizedBox(height: 20),
                      _WelcomeCard(name: session.name),
                      const SizedBox(height: 16),
                      _ScanPlantCard(
                        onTap: () => context.tabsRouter.setActiveIndex(1),
                      ),
                      const SizedBox(height: 22),
                      const _SectionTitle('Weather & farm alerts'),
                      const SizedBox(height: 12),
                      const _WeatherHeroCard(),
                      const SizedBox(height: 12),
                      const Row(
                        children: [
                          Expanded(
                            child: _AlertCard(
                              icon: Icons.local_fire_department_rounded,
                              iconColor: Color(0xFFFF735C),
                              title: 'Heat alert',
                              detail: '35Ãƒâ€šÃ‚Â°C this afternoon',
                              status: 'Water before 10 AM',
                            ),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: _AlertCard(
                              icon: Icons.water_drop_rounded,
                              iconColor: Color(0xFF68C9FF),
                              title: 'Rain risk',
                              detail: '60% after 5 PM',
                              status: 'Delay spraying',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 22),
                      const _SectionTitle(
                        'TodayÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s action plan',
                      ),
                      const SizedBox(height: 12),
                      const _ActionPlanCard(),
                      const SizedBox(height: 22),
                      const _SectionTitle('Government farmer services'),
                      const SizedBox(height: 12),
                      _QuickServices(
                        onNearbySellers: () => showModalBottomSheet<void>(
                          context: context,
                          isScrollControlled: true,
                          useSafeArea: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => const FractionallySizedBox(
                            heightFactor: .96,
                            child: NearbySellersPanel(),
                          ),
                        ),
                        onMarketplace: () =>
                            context.tabsRouter.setActiveIndex(4),
                        onProfile: () =>
                            context.router.push(const ProfileRoute()),
                      ),
                      const SizedBox(height: 22),
                      const _SectionTitle('Crop health overview'),
                      const SizedBox(height: 12),
                      const _CropHealthCard(),
                      const SizedBox(height: 22),
                      ...content.actions.map(
                        (action) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _GlassListTile(
                            icon: action.icon,
                            title: action.title,
                            subtitle: action.description,
                            onTap: () {
                              if (action.tabIndex != null) {
                                context.tabsRouter.setActiveIndex(
                                  action.tabIndex!,
                                );
                              } else {
                                showModalBottomSheet<void>(
                                  context: context,
                                  isScrollControlled: true,
                                  useSafeArea: true,
                                  backgroundColor: Colors.transparent,
                                  builder: (_) => const FractionallySizedBox(
                                    heightFactor: .94,
                                    child: CropDiagnosisPanel(),
                                  ),
                                );
                              }
                            },
                          ),
                        ),
                      ),
                    ],
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

class _FarmBackground extends StatelessWidget {
  const _FarmBackground();

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset('assets/images/plant_leaf.jpg', fit: BoxFit.cover),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xB80A3028), Color(0xE009221D), Color(0xFA03100D)],
              stops: [0, .48, 1],
            ),
          ),
        ),
        Positioned(
          top: -70,
          right: -55,
          child: Container(
            width: 240,
            height: 240,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF42F1C0).withValues(alpha: .10),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF42F1C0).withValues(alpha: .22),
                  blurRadius: 100,
                  spreadRadius: 12,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.name,
    required this.role,
    required this.onProfile,
  });
  final String name;
  final String role;
  final VoidCallback onProfile;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(
              colors: [Color(0xFF28E0B1), Color(0xFF33B96E)],
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF33E6B6).withValues(alpha: .25),
                blurRadius: 20,
              ),
            ],
          ),
          child: const Icon(Icons.eco_rounded, color: Colors.white, size: 28),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'FarmerGov AI',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                role.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFFA8C9BE),
                  fontSize: 11,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        _HeaderButton(icon: Icons.search_rounded, onTap: () {}),
        const SizedBox(width: 8),
        _ProfileAvatar(name: name, onTap: onProfile),
      ],
    );
  }
}

class _HeaderButton extends StatelessWidget {
  const _HeaderButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: .08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withValues(alpha: .11)),
        ),
        child: Icon(icon, color: Colors.white),
      ),
    );
  }
}

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({required this.name, required this.onTap});

  final String name;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final initial = name.trim().isEmpty ? 'F' : name.trim()[0].toUpperCase();
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Container(
        width: 43,
        height: 43,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: const LinearGradient(
            colors: [Color(0xFF77F6D3), Color(0xFF2FCF9F)],
          ),
          border: Border.all(
            color: Colors.white.withValues(alpha: .62),
            width: 1.4,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF53E8B8).withValues(alpha: .28),
              blurRadius: 18,
            ),
          ],
        ),
        padding: const EdgeInsets.all(2.5),
        child: Container(
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Color(0xFF173B33),
          ),
          alignment: Alignment.center,
          child: Text(
            initial,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 17,
            ),
          ),
        ),
      ),
    );
  }
}

class _WelcomeCard extends StatelessWidget {
  const _WelcomeCard({required this.name});
  final String name;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, $name!',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 25,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 7),
                const Text(
                  'Your farm assistant is ready with local weather guidance and crop care actions.',
                  style: TextStyle(color: Color(0xFFC7DDD6), height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          const Icon(
            Icons.agriculture_rounded,
            color: Color(0xFF53E8B8),
            size: 52,
          ),
        ],
      ),
    );
  }
}

class _ScanPlantCard extends StatelessWidget {
  const _ScanPlantCard({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      onTap: onTap,
      borderRadius: 26,
      blur: 10,
      opacity: .11,
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            width: 102,
            height: 102,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(21),
              image: const DecorationImage(
                image: AssetImage('assets/images/plant_leaf.jpg'),
                fit: BoxFit.cover,
              ),
              border: Border.all(
                color: const Color(0xFF68F3CE).withValues(alpha: .55),
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF39E7B8).withValues(alpha: .20),
                  blurRadius: 22,
                ),
              ],
            ),
            child: Center(
              child: Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF06251F).withValues(alpha: .62),
                  border: Border.all(color: const Color(0xFF71F6D1)),
                ),
                child: const Icon(
                  Icons.center_focus_strong_rounded,
                  color: Color(0xFF76F7D3),
                  size: 30,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Scan Plant',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 7),
                Text(
                  'AI disease detection, crop health and treatment guidance',
                  style: TextStyle(
                    color: Color(0xFFC5DDD6),
                    height: 1.35,
                    fontSize: 13,
                  ),
                ),
                SizedBox(height: 10),
                Row(
                  children: [
                    Icon(
                      Icons.auto_awesome_rounded,
                      color: Color(0xFF6AF2CE),
                      size: 15,
                    ),
                    SizedBox(width: 5),
                    Text(
                      'AI SCANNER READY',
                      style: TextStyle(
                        color: Color(0xFF6AF2CE),
                        fontSize: 10,
                        letterSpacing: 1,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right_rounded,
            color: Color(0xFF70F2CF),
            size: 30,
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 20,
        fontWeight: FontWeight.w900,
      ),
    );
  }
}

class _WeatherHeroCard extends StatelessWidget {
  const _WeatherHeroCard();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        children: [
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Dhaka, Bangladesh',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 7),
                    Text(
                      '32Ãƒâ€šÃ‚Â°',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 46,
                        fontWeight: FontWeight.w900,
                        height: 1,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      'Feels like 36\u00B0  •  Humidity 78%',
                      style: TextStyle(color: Color(0xFFB9D2CA)),
                    ),
                  ],
                ),
              ),
              Icon(Icons.cloudy_snowing, color: Color(0xFF7BD9FF), size: 62),
            ],
          ),
          const SizedBox(height: 18),
          Container(height: 1, color: Colors.white.withValues(alpha: .09)),
          const SizedBox(height: 14),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _ForecastDay(
                day: 'Now',
                icon: Icons.cloud_rounded,
                temp: '32\u00B0',
              ),
              _ForecastDay(
                day: '3 PM',
                icon: Icons.wb_sunny_rounded,
                temp: '35\u00B0',
              ),
              _ForecastDay(
                day: '6 PM',
                icon: Icons.grain_rounded,
                temp: '30\u00B0',
              ),
              _ForecastDay(
                day: '9 PM',
                icon: Icons.thunderstorm_rounded,
                temp: '28\u00B0',
              ),
              _ForecastDay(
                day: '12 AM',
                icon: Icons.cloud_rounded,
                temp: '27\u00B0',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ForecastDay extends StatelessWidget {
  const _ForecastDay({
    required this.day,
    required this.icon,
    required this.temp,
  });
  final String day;
  final IconData icon;
  final String temp;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          day,
          style: const TextStyle(color: Color(0xFF9BBDB3), fontSize: 11),
        ),
        const SizedBox(height: 7),
        Icon(icon, color: const Color(0xFF7DE5C8), size: 22),
        const SizedBox(height: 7),
        Text(
          temp,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _AlertCard extends StatelessWidget {
  const _AlertCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.detail,
    required this.status,
  });
  final IconData icon;
  final Color iconColor;
  final String title;
  final String detail;
  final String status;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 29),
          const SizedBox(height: 11),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            detail,
            style: const TextStyle(color: Color(0xFFB5CDC6), fontSize: 12),
          ),
          const SizedBox(height: 9),
          Text(
            status,
            style: const TextStyle(
              color: Color(0xFF64E8C1),
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionPlanCard extends StatelessWidget {
  const _ActionPlanCard();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(18),
      child: const Column(
        children: [
          _ActionStep(
            number: '1',
            title: 'Water vegetables early',
            detail:
                'Complete irrigation before 10 AM because afternoon heat will be high.',
          ),
          SizedBox(height: 15),
          _ActionStep(
            number: '2',
            title: 'Do not spray after 4 PM',
            detail:
                'Rain may wash away pesticide and reduce treatment effectiveness.',
          ),
          SizedBox(height: 15),
          _ActionStep(
            number: '3',
            title: 'Check tomato leaves',
            detail:
                'Humidity is favorable for leaf spot. Scan any new marks immediately.',
          ),
        ],
      ),
    );
  }
}

class _ActionStep extends StatelessWidget {
  const _ActionStep({
    required this.number,
    required this.title,
    required this.detail,
  });
  final String number;
  final String title;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Color(0xFF35DFAF),
          ),
          alignment: Alignment.center,
          child: Text(
            number,
            style: const TextStyle(
              color: Color(0xFF063428),
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                detail,
                style: const TextStyle(
                  color: Color(0xFFABC8BF),
                  height: 1.35,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _QuickServices extends StatelessWidget {
  const _QuickServices({
    required this.onNearbySellers,
    required this.onMarketplace,
    required this.onProfile,
  });
  final VoidCallback onNearbySellers;
  final VoidCallback onMarketplace;
  final VoidCallback onProfile;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.25,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      children: [
        _ServiceTile(
          icon: Icons.storefront_rounded,
          title: 'Marketplace',
          subtitle: 'Buy and sell crops',
          onTap: onMarketplace,
        ),
        _ServiceTile(
          icon: Icons.local_pharmacy_rounded,
          title: 'Nearby sellers',
          subtitle: 'Medicine and inputs',
          onTap: onNearbySellers,
        ),
        _ServiceTile(
          icon: Icons.price_check_rounded,
          title: 'Market price',
          subtitle: 'Latest local rates',
          onTap: onMarketplace,
        ),
        _ServiceTile(
          icon: Icons.badge_outlined,
          title: 'My profile',
          subtitle: 'Government records',
          onTap: onProfile,
        ),
      ],
    );
  }
}

class _ServiceTile extends StatelessWidget {
  const _ServiceTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: GlassCard(
        padding: const EdgeInsets.all(15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: const Color(0xFF5BE6BE), size: 31),
            const SizedBox(height: 10),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              subtitle,
              style: const TextStyle(color: Color(0xFFA8C4BB), fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

class _CropHealthCard extends StatelessWidget {
  const _CropHealthCard();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        children: [
          const Row(
            children: [
              Expanded(
                child: Text(
                  'Overall crop health',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Text(
                '82%',
                style: TextStyle(
                  color: Color(0xFF5EE9BF),
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: const LinearProgressIndicator(
              value: .82,
              minHeight: 11,
              backgroundColor: Color(0xFF163C33),
              valueColor: AlwaysStoppedAnimation(Color(0xFF46E0B2)),
            ),
          ),
          const SizedBox(height: 16),
          const Row(
            children: [
              Expanded(
                child: _HealthStat(
                  label: 'Healthy',
                  value: '18',
                  icon: Icons.eco_rounded,
                ),
              ),
              Expanded(
                child: _HealthStat(
                  label: 'Needs care',
                  value: '4',
                  icon: Icons.warning_amber_rounded,
                ),
              ),
              Expanded(
                child: _HealthStat(
                  label: 'Scans',
                  value: '26',
                  icon: Icons.center_focus_strong_rounded,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HealthStat extends StatelessWidget {
  const _HealthStat({
    required this.label,
    required this.value,
    required this.icon,
  });
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: const Color(0xFF72E7C7), size: 22),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 18,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Color(0xFF9FBBB2), fontSize: 11),
        ),
      ],
    );
  }
}

class _GlassListTile extends StatelessWidget {
  const _GlassListTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: const Color(0xFF44DFB2).withValues(alpha: .13),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Icon(icon, color: const Color(0xFF5EE5BF)),
            ),
            const SizedBox(width: 13),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xFFA7C1B9),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Color(0xFF74DCC1)),
          ],
        ),
      ),
    );
  }
}
