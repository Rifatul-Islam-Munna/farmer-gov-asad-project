import 'package:auto_route/auto_route.dart';
import 'package:get_it/get_it.dart';

import '../storage/session_storage.dart';
import 'app_router.dart';

class AuthGuard extends AutoRouteGuard {
  @override
  Future<void> onNavigation(
    NavigationResolver resolver,
    StackRouter router,
  ) async {
    final session = GetIt.I<SessionStorage>();
    final hasSession = await session.hasSession();

    if (hasSession) {
      resolver.next(true);
      return;
    }

    resolver.next(false);
    await router.replaceAll([const LoginRoute()]);
  }
}
