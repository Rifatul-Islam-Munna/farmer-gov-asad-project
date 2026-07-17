import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/navigation/app_router_instance.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/storage/session_storage.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';

@RoutePage()
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    unawaited(_resolveInitialRoute());
  }

  Future<void> _resolveInitialRoute() async {
    await Future<void>.delayed(const Duration(milliseconds: 1300));
    final hasSession = await GetIt.I<SessionStorage>().hasSession();

    if (!mounted) return;

    if (hasSession) {
      await appRouter.replaceAll([
        MainShellRoute(
          children: [
            homeTab(children: [const HomeRoute()]),
          ],
        ),
      ]);
      return;
    }

    await appRouter.replaceAll([const LoginRoute()]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SizedBox(
        width: double.infinity,
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const GlassCard(
                padding: EdgeInsets.all(24),
                borderRadius: 42,
                blur: 5.5,
                opacity: .13,
                color: AppColors.primary,
                child: Icon(
                  Icons.agriculture_rounded,
                  color: Colors.white,
                  size: 64,
                ),
              ),
              const SizedBox(height: 28),
              const Text(
                'Farmer Government',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 29,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Smart farming, fair markets, stronger communities',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.88),
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 38),
              const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
