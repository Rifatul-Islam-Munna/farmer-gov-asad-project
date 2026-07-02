import 'package:animations/animations.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/router/app_router.dart';
import '../core/theme/app_theme.dart';

const _tabs = [
  _NavigationTab(Icons.home_outlined, Icons.home_rounded, 'Home'),
  _NavigationTab(Icons.storefront_outlined, Icons.storefront_rounded, 'Market'),
  _NavigationTab(Icons.add_box_outlined, Icons.add_box_rounded, 'Post'),
  _NavigationTab(Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
];

@RoutePage()
class MainShellPage extends StatelessWidget {
  const MainShellPage({super.key});

  @override
  Widget build(BuildContext context) {
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
      routes: [
        homeTab(),
        marketplaceTab(),
        listingTab(),
        profileTab(),
      ],
      bottomNavigationBuilder: (_, tabsRouter) {
        return _BottomNavigation(tabsRouter: tabsRouter);
      },
    );
  }
}

class _BottomNavigation extends StatelessWidget {
  const _BottomNavigation({required this.tabsRouter});

  final TabsRouter tabsRouter;

  void _changeTab(int index) {
    HapticFeedback.selectionClick();
    for (var tabIndex = 0; tabIndex < _tabs.length; tabIndex++) {
      tabsRouter.stackRouterOfIndex(tabIndex)?.popUntilRoot();
    }
    tabsRouter.setActiveIndex(index);
  }

  @override
  Widget build(BuildContext context) {
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
            children: List.generate(
              _tabs.length,
              (index) {
                final tab = _tabs[index];
                final active = tabsRouter.activeIndex == index;

                return Expanded(
                  child: InkWell(
                    onTap: () => _changeTab(index),
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
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _NavigationTab {
  const _NavigationTab(this.icon, this.activeIcon, this.label);

  final IconData icon;
  final IconData activeIcon;
  final String label;
}
