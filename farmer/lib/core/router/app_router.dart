import 'package:animations/animations.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/auth/presentation/pages/verification_pending_page.dart';
import '../../features/diagnosis/presentation/scanner_page.dart';
import '../../features/home/presentation/pages/alerts_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/marketplace/presentation/pages/listing_form_page.dart';
import '../../features/marketplace/presentation/pages/marketplace_page.dart';
import '../../features/marketplace/presentation/pages/sell_product_page.dart';
import '../../features/plants/presentation/plants_page.dart';
import '../../features/profile/presentation/pages/account_page.dart';
import '../../pages/main_shell.dart';
import 'auth_guard.dart';

part 'app_router.gr.dart';

const homeTab = EmptyShellRoute('HomeTab');
const scannerTab = EmptyShellRoute('ScannerTab');
const plantsTab = EmptyShellRoute('PlantsTab');
const alertsTab = EmptyShellRoute('AlertsTab');
const shopTab = EmptyShellRoute('ShopTab');

@AutoRouterConfig(replaceInRouteName: 'Screen|Page,Route')
class AppRouter extends RootStackRouter {
  @override
  RouteType get defaultRouteType => RouteType.custom(
    transitionsBuilder: _smoothPageTransition,
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
      page: VerificationPendingRoute.page,
      path: '/verification-pending',
    ),
    RedirectRoute(path: '/home', redirectTo: '/main/home'),
    RedirectRoute(path: '/scanner', redirectTo: '/main/scanner'),
    RedirectRoute(path: '/plants', redirectTo: '/main/plants'),
    RedirectRoute(path: '/alerts', redirectTo: '/main/alerts'),
    RedirectRoute(path: '/shop', redirectTo: '/main/shop'),
    RedirectRoute(path: '/sell', redirectTo: '/main/shop/sell'),
    RedirectRoute(path: '/listing-form', redirectTo: '/main/shop/listing-form'),
    RedirectRoute(path: '/profile', redirectTo: '/main/home/profile'),
    AutoRoute(
      page: MainShellRoute.page,
      path: '/main',
      guards: [AuthGuard()],
      children: [
        AutoRoute(
          page: homeTab.page,
          path: 'home',
          initial: true,
          children: [
            AutoRoute(page: HomeRoute.page, path: '', initial: true),
            AutoRoute(page: ProfileRoute.page, path: 'profile'),
          ],
        ),
        AutoRoute(
          page: scannerTab.page,
          path: 'scanner',
          children: [
            AutoRoute(page: ScannerRoute.page, path: '', initial: true),
          ],
        ),
        AutoRoute(
          page: plantsTab.page,
          path: 'plants',
          children: [
            AutoRoute(page: PlantsRoute.page, path: '', initial: true),
          ],
        ),
        AutoRoute(
          page: alertsTab.page,
          path: 'alerts',
          children: [
            AutoRoute(page: AlertsRoute.page, path: '', initial: true),
          ],
        ),
        AutoRoute(
          page: shopTab.page,
          path: 'shop',
          children: [
            AutoRoute(page: MarketplaceRoute.page, path: '', initial: true),
            AutoRoute(page: SellProductRoute.page, path: 'sell'),
            AutoRoute(page: ListingFormRoute.page, path: 'listing-form'),
          ],
        ),
      ],
    ),
  ];
}

Widget _smoothPageTransition(
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

class HomeBackFallback extends StatelessWidget {
  const HomeBackFallback({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: context.router.canPop(),
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && context.mounted) {
          goHome(context);
        }
      },
      child: child,
    );
  }
}

Future<void> popOrHome(BuildContext context) async {
  if (context.router.canPop()) {
    final didPop = await context.router.maybePop();
    if (didPop) return;
  }
  if (context.mounted) {
    await goHome(context);
  }
}

Future<void> goHome(BuildContext context) {
  return context.router.root.replaceAll([
    MainShellRoute(
      children: [
        homeTab(children: [const HomeRoute()]),
      ],
    ),
  ]);
}
