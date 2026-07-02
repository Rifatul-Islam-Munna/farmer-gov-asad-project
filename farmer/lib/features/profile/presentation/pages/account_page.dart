import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/navigation/app_router_instance.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/storage/session_storage.dart';
import '../../../auth/data/datasources/auth_api.dart';

@RoutePage(name: 'ProfileRoute')
class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  Future<void> _signOut() async {
    await AuthApi().logout();
    await appRouter.replaceAll([const LoginRoute()]);
  }

  @override
  Widget build(BuildContext context) {
    final session = GetIt.I<SessionStorage>();

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const CircleAvatar(
            radius: 42,
            child: Icon(Icons.person_rounded, size: 46),
          ),
          const SizedBox(height: 16),
          Text(
            session.name,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(session.role, textAlign: TextAlign.center),
          const SizedBox(height: 28),
          OutlinedButton.icon(
            onPressed: _signOut,
            icon: const Icon(Icons.logout_rounded),
            label: const Text('Sign out'),
          ),
        ],
      ),
    );
  }
}
