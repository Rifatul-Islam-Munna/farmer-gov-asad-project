import 'package:animations/animations.dart';
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
      transitionBuilder: (context, child, animation) => FadeThroughTransition(
        animation: animation,
        secondaryAnimation: kAlwaysDismissedAnimation,
        child: child,
      ),
      extendBody: true,
      routes: [homeTab(), scannerTab(), plantsTab(), alertsTab(), shopTab()],
      bottomNavigationBuilder: (_, tabsRouter) =>
          _BottomNavigation(tabsRouter: tabsRouter),
    );
  }
}

class _BottomNavigation extends StatelessWidget {
  const _BottomNavigation({required this.tabsRouter});

  final TabsRouter tabsRouter;

  void _handleTabTap(int index) {
    HapticFeedback.selectionClick();
    for (var i = 0; i < items.length; i++) {
      tabsRouter.stackRouterOfIndex(i)?.popUntilRoot();
    }
    tabsRouter.setActiveIndex(index);
  }

  static const items = [
    _NavigationItem(Icons.home_outlined, Icons.home_rounded, 'Home'),
    _NavigationItem(
      Icons.center_focus_strong_outlined,
      Icons.camera_alt_rounded,
      'Scanner',
    ),
    _NavigationItem(
      Icons.local_florist_outlined,
      Icons.local_florist_rounded,
      'Plants',
    ),
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
    final activeIndex = tabsRouter.activeIndex;

    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 0, 18, 14),
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.bottomCenter,
        children: [
          GlassCard(
            borderRadius: 46,
            blur: 5.5,
            opacity: .17,
            glow: true,
            child: SizedBox(
              height: 86,
              child: Row(
                children: List.generate(items.length, (index) {
                  final item = items[index];
                  final active = activeIndex == index;
                  return Expanded(
                    child: _NavButton(
                      item: item,
                      active: active,
                      prominent: index == 1 || index == 4,
                      onTap: () => _handleTabTap(index),
                    ),
                  );
                }),
              ),
            ),
          ),
          Positioned.fill(
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(46),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: .20),
                    width: 1.15,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.item,
    required this.active,
    required this.prominent,
    required this.onTap,
  });

  final _NavigationItem item;
  final bool active;
  final bool prominent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final activeColor = AppColors.primary;
    final inactiveColor = Colors.white.withValues(alpha: .62);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Stack(
        alignment: Alignment.center,
        clipBehavior: Clip.none,
        children: [
          AnimatedOpacity(
            duration: const Duration(milliseconds: 220),
            opacity: active ? 1 : 0,
            child: Container(
              width: prominent ? 70 : 62,
              height: 92,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.primary.withValues(alpha: .42),
                    AppColors.primary.withValues(alpha: .16),
                    Colors.transparent,
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: .46),
                    blurRadius: 30,
                    spreadRadius: -6,
                  ),
                ],
              ),
            ),
          ),
          if (active)
            Positioned(
              top: 0,
              child: Container(
                width: prominent ? 56 : 44,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(999),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: .95),
                      blurRadius: 18,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),
            ),
          if (active)
            Positioned(
              bottom: 0,
              child: Container(
                width: prominent ? 52 : 42,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(999),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: .95),
                      blurRadius: 18,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),
            ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                curve: Curves.easeOutCubic,
                width: active && prominent ? 42 : 36,
                height: active && prominent ? 42 : 36,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(
                    active && prominent ? 15 : 18,
                  ),
                  color: active && prominent
                      ? AppColors.primary.withValues(alpha: .22)
                      : Colors.transparent,
                  border: active && prominent
                      ? Border.all(
                          color: AppColors.primary.withValues(alpha: .65),
                        )
                      : null,
                  boxShadow: active
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: .45),
                            blurRadius: 20,
                            spreadRadius: -4,
                          ),
                        ]
                      : null,
                ),
                child: Icon(
                  active ? item.activeIcon : item.icon,
                  size: active && prominent ? 28 : 27,
                  color: active ? activeColor : inactiveColor,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                item.label,
                maxLines: 1,
                style: TextStyle(
                  fontSize: 14,
                  height: 1,
                  fontWeight: active ? FontWeight.w800 : FontWeight.w500,
                  color: active ? activeColor : inactiveColor,
                  shadows: active
                      ? [
                          Shadow(
                            color: AppColors.primary.withValues(alpha: .72),
                            blurRadius: 12,
                          ),
                        ]
                      : null,
                ),
              ),
            ],
          ),
          if (item.label == 'Alerts')
            Positioned(
              top: 24,
              right: 21,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: const Color(0xFFFF6070),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFF6070).withValues(alpha: .85),
                      blurRadius: 10,
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

class _NavigationItem {
  const _NavigationItem(this.icon, this.activeIcon, this.label);
  final IconData icon;
  final IconData activeIcon;
  final String label;
}
