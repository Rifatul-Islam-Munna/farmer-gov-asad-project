import 'package:auto_route/auto_route.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/navigation/app_router_instance.dart';
import '../../../../core/navigation/auth_route_resolver.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/storage/session_storage.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/app_toast.dart';
import '../../data/datasources/auth_api.dart';
import '../../data/datasources/profile_api.dart';

@RoutePage()
class VerificationPendingPage extends StatefulWidget {
  const VerificationPendingPage({super.key});

  @override
  State<VerificationPendingPage> createState() =>
      _VerificationPendingPageState();
}

class _VerificationPendingPageState extends State<VerificationPendingPage> {
  bool _checking = false;
  bool _signingOut = false;

  Future<void> _checkStatus() async {
    setState(() => _checking = true);
    try {
      final user = await ProfileApi().getMyProfile();
      if (user.verificationStatus == 'approved') {
        AppToast.show('Your account is approved. Welcome!');
        await AuthRouteResolver.openForUser(user);
        return;
      }
      AppToast.show(
        user.verificationStatus == 'rejected'
            ? 'Your verification needs attention.'
            : 'Your documents are still being reviewed.',
      );
    } catch (error) {
      AppToast.show(_messageFrom(error));
    } finally {
      if (mounted) setState(() => _checking = false);
    }
  }

  Future<void> _logout() async {
    setState(() => _signingOut = true);
    await AuthApi().logout();
    await appRouter.replaceAll([const LoginRoute()]);
  }

  String _messageFrom(Object error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['message'] != null) {
        return data['message'].toString();
      }
    }
    return 'Could not refresh the verification status.';
  }

  @override
  Widget build(BuildContext context) {
    final session = GetIt.I<SessionStorage>();
    final rejected = session.status == 'rejected';

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(24, 30, 24, 26),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primaryDark, AppColors.primary],
                ),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Column(
                children: [
                  SizedBox(
                    width: 132,
                    height: 112,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 96,
                          height: 96,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.14),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.32),
                              width: 2,
                            ),
                          ),
                          child: Icon(
                            rejected
                                ? Icons.assignment_late_outlined
                                : Icons.fact_check_outlined,
                            color: Colors.white,
                            size: 52,
                          ),
                        ),
                        const Positioned(
                          right: 0,
                          top: 4,
                          child: CircleAvatar(
                            radius: 22,
                            backgroundColor: AppColors.secondary,
                            foregroundColor: AppColors.primaryDark,
                            child: Icon(Icons.eco_rounded),
                          ),
                        ),
                        const Positioned(
                          left: 0,
                          bottom: 2,
                          child: CircleAvatar(
                            radius: 19,
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.primary,
                            child: Icon(Icons.verified_user_outlined),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    rejected
                        ? 'Verification needs attention'
                        : 'Verification in progress',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 9),
                  Text(
                    rejected
                        ? 'Please review your submitted information and contact support before trying again.'
                        : 'Your ${session.role} account and documents are being reviewed by the administration team.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Color(0xFFE7F5E3),
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'What happens next?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            const _StatusStep(
              icon: Icons.description_outlined,
              title: 'Information received',
              description:
                  'Your profile and document details have been submitted.',
              completed: true,
            ),
            const SizedBox(height: 10),
            _StatusStep(
              icon: Icons.manage_search_rounded,
              title: 'Administrative review',
              description:
                  'The team checks identity, business and service information.',
              completed: rejected,
              active: !rejected,
            ),
            const SizedBox(height: 10),
            const _StatusStep(
              icon: Icons.lock_open_rounded,
              title: 'Feature access',
              description:
                  'Marketplace and role-specific tools unlock after approval.',
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _checking ? null : _checkStatus,
              icon: _checking
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.refresh_rounded),
              label: Text(_checking ? 'Checking status...' : 'Check status'),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _signingOut ? null : _logout,
              icon: _signingOut
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.logout_rounded),
              label: const Text('Sign out'),
            ),
            const SizedBox(height: 16),
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.info_outline_rounded,
                  size: 18,
                  color: AppColors.textSecondary,
                ),
                SizedBox(width: 7),
                Flexible(
                  child: Text(
                    'This is a demo verification flow. Admin review tools come next.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusStep extends StatelessWidget {
  const _StatusStep({
    required this.icon,
    required this.title,
    required this.description,
    this.completed = false,
    this.active = false,
  });

  final IconData icon;
  final String title;
  final String description;
  final bool completed;
  final bool active;

  @override
  Widget build(BuildContext context) {
    final accent = completed || active
        ? AppColors.primary
        : AppColors.textSecondary;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              backgroundColor: completed || active
                  ? const Color(0xFFEAF4E6)
                  : const Color(0xFFF0F2EF),
              foregroundColor: accent,
              child: Icon(completed ? Icons.check_rounded : icon),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: const TextStyle(
                      height: 1.4,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
