import 'package:animations/animations.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get_it/get_it.dart';

import '../core/router/app_router.dart';
import '../core/storage/session_storage.dart';
import '../core/theme/app_theme.dart';
import '../features/auth/presentation/pages/verification_pending_page.dart';

@RoutePage()
class MainShellPage extends StatelessWidget {
  const MainShellPage({super.key});

  @override
  Widget build(BuildContext context) {
    final session = GetIt.I<SessionStorage>();
    if (!session.isApproved) {
      return const VerificationPendingPage();
    }

    return AutoTabsScaffold(
      homeIndex: 0,
      animationDuration: const Duration(milliseconds: 240),
      animationCurve: Curves.easeOutCubic,
      transitionBuilder: (context, child, animation) {
        return FadeThroughTransition(
          animation: animation,
          secondaryAnimation: kAlwaysDismissedAnimation,
          child: child,
        );
      },
      routes: [homeTab(), marketplaceTab(), listingTab(), profileTab()],
      bottomNavigationBuilder: (_, tabsRouter) {
        return _BottomNavigation(
          tabsRouter: tabsRouter,
          role: session.role,
        );
      },
    );
  }
}

class _BottomNavigation extends StatelessWidget {
  const _BottomNavigation({required this.tabsRouter, required this.role});

  final TabsRouter tabsRouter;
  final String role;

  void _changeTab(int index, int count) {
    HapticFeedback.selectionClick();
    for (var tabIndex = 0; tabIndex < count; tabIndex++) {
      tabsRouter.stackRouterOfIndex(tabIndex)?.popUntilRoot();
    }
    tabsRouter.setActiveIndex(index);
  }

  @override
  Widget build(BuildContext context) {
    final tabs = _tabsForRole(role);

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 66,
          child: Row(
            children: List.generate(tabs.length, (index) {
              final tab = tabs[index];
              final active = tabsRouter.activeIndex == index;

              return Expanded(
                child: InkWell(
                  onTap: () => _changeTab(index, tabs.length),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        active ? tab.activeIcon : tab.icon,
                        color: active
                            ? AppColors.primary
                            : AppColors.textSecondary,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        tab.label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight:
                              active ? FontWeight.w700 : FontWeight.w500,
                          color: active
                              ? AppColors.primary
                              : AppColors.textSecondary,
                        ),
                      ),
                    ],
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

List<_NavigationTab> _tabsForRole(String role) {
  final third = switch (role) {
    'agent' => const _NavigationTab(
        Icons.support_agent_outlined,
        Icons.support_agent_rounded,
        'Assist',
      ),
    'buyer' => const _NavigationTab(
        Icons.handshake_outlined,
        Icons.handshake_rounded,
        'Deals',
      ),
    'medicineSeller' => const _NavigationTab(
        Icons.inventory_2_outlined,
        Icons.inventory_2_rounded,
        'Inventory',
      ),
    'admin' => const _NavigationTab(
        Icons.admin_panel_settings_outlined,
        Icons.admin_panel_settings_rounded,
        'Admin',
      ),
    _ => const _NavigationTab(
        Icons.add_box_outlined,
        Icons.add_box_rounded,
        'Sell',
      ),
  };

  return [
    const _NavigationTab(Icons.home_outlined, Icons.home_rounded, 'Home'),
    const _NavigationTab(
      Icons.storefront_outlined,
      Icons.storefront_rounded,
      'Market',
    ),
    third,
    const _NavigationTab(
      Icons.person_outline_rounded,
      Icons.person_rounded,
      'Profile',
    ),
  ];
}

class _NavigationTab {
  const _NavigationTab(this.icon, this.activeIcon, this.label);

  final IconData icon;
  final IconData activeIcon;
  final String label;
}
