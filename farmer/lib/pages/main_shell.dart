import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get_it/get_it.dart';

import '../core/router/app_router.dart';
import '../core/storage/session_storage.dart';
import '../core/theme/app_theme.dart';
import '../core/widgets/glass_card.dart';
import '../features/auth/presentation/pages/verification_pending_page.dart';

@RoutePage()
class MainShellPage extends StatelessWidget {
  const MainShellPage({super.key});

  @override
  Widget build(BuildContext context) {
    final session = GetIt.I<SessionStorage>();
    if (!session.isApproved) return const VerificationPendingPage();

    return AutoTabsScaffold(
      homeIndex: 0,
      animationDuration: const Duration(milliseconds: 220),
      animationCurve: Curves.easeOutCubic,
      routes: [homeTab(), scannerTab(), plantsTab(), alertsTab(), shopTab()],
      bottomNavigationBuilder: (_, tabsRouter) =>
          _BottomNavigation(tabsRouter: tabsRouter),
    );
  }
}

class _BottomNavigation extends StatelessWidget {
  const _BottomNavigation({required this.tabsRouter});

  final TabsRouter tabsRouter;

  static const items = [
    _NavigationItem(Icons.home_outlined, Icons.home_rounded, 'Home'),
    _NavigationItem(
      Icons.center_focus_strong_outlined,
      Icons.center_focus_strong_rounded,
      'Scanner',
    ),
    _NavigationItem(Icons.eco_outlined, Icons.eco_rounded, 'Plants'),
    _NavigationItem(
      Icons.notifications_none_rounded,
      Icons.notifications_rounded,
      'Alerts',
    ),
    _NavigationItem(
      Icons.shopping_cart_outlined,
      Icons.shopping_cart_rounded,
      'Shop',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      borderRadius: 29,
      blur: 9,
      opacity: .10,
      glow: true,
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 74,
          child: Row(
            children: List.generate(items.length, (index) {
              final item = items[index];
              final active = tabsRouter.activeIndex == index;
              return Expanded(
                child: InkWell(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    tabsRouter.setActiveIndex(index);
                  },
                  borderRadius: BorderRadius.circular(20),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    margin: const EdgeInsets.symmetric(
                      horizontal: 2,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(19),
                      gradient: active
                          ? LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Colors.white.withValues(alpha: .14),
                                AppColors.primary.withValues(alpha: .14),
                              ],
                            )
                          : null,
                      border: active
                          ? Border.all(
                              color: AppColors.primary.withValues(alpha: .38),
                            )
                          : null,
                      boxShadow: active
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: .22),
                                blurRadius: 20,
                              ),
                            ]
                          : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          active ? item.activeIcon : item.icon,
                          size: 23,
                          color: active
                              ? AppColors.primary
                              : AppColors.textSecondary,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: active
                                ? FontWeight.w800
                                : FontWeight.w600,
                            color: active
                                ? AppColors.primary
                                : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavigationItem {
  const _NavigationItem(this.icon, this.activeIcon, this.label);
  final IconData icon;
  final IconData activeIcon;
  final String label;
}
