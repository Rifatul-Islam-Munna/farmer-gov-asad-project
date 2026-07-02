import 'package:animations/animations.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/marketplace/presentation/pages/listing_form_page.dart';
import '../../features/marketplace/presentation/pages/marketplace_page.dart';
import '../../features/profile/presentation/pages/account_page.dart';
import '../../pages/main_shell.dart';

part 'app_router.gr.dart';

const homeTab = EmptyShellRoute('HomeTab');
const marketplaceTab = EmptyShellRoute('MarketplaceTab');
const listingTab = EmptyShellRoute('ListingTab');
const profileTab = EmptyShellRoute('ProfileTab');

@AutoRouterConfig(replaceInRouteName: 'Screen|Page,Route')
class AppRouter extends RootStackRouter {
  @override
  RouteType get defaultRouteType => RouteType.custom(
    transitionsBuilder: _pageTransition,
    duration: const Duration(milliseconds: 280),
    reverseDuration: const Duration(milliseconds: 240),
    enablePredictiveBackGesture: true,
  );

  @override
  List<AutoRoute> get routes => [
    AutoRoute(page: SplashRoute.page, path: '/', initial: true),
    AutoRoute(page: LoginRoute.page, path: '/login'),
    AutoRoute(page: RegisterRoute.page, path: '/register'),
    AutoRoute(
      page: MainShellRoute.page,
      path: '/main',
      children: [
        AutoRoute(
          page: homeTab.page,
          path: 'home',
          initial: true,
          children: [
            AutoRoute(page: HomeRoute.page, path: '', initial: true),
          ],
        ),
        AutoRoute(
          page: marketplaceTab.page,
          path: 'marketplace',
          children: [
            AutoRoute(page: MarketplaceRoute.page, path: '', initial: true),
          ],
        ),
        AutoRoute(
          page: listingTab.page,
          path: 'listing',
          children: [
            AutoRoute(page: ListingFormRoute.page, path: '', initial: true),
          ],
        ),
        AutoRoute(
          page: profileTab.page,
          path: 'profile',
          children: [
            AutoRoute(page: ProfileRoute.page, path: '', initial: true),
          ],
        ),
      ],
    ),
  ];
}

Widget _pageTransition(
  BuildContext context,
  Animation<double> animation,
  Animation<double> secondaryAnimation,
  Widget child,
) {
  return SharedAxisTransition(
    animation: animation,
    secondaryAnimation: secondaryAnimation,
    transitionType: SharedAxisTransitionType.horizontal,
    fillColor: Theme.of(context).scaffoldBackgroundColor,
    child: child,
  );
}
