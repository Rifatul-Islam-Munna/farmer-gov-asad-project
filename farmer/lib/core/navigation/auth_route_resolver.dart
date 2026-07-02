import 'package:get_it/get_it.dart';

import '../../features/auth/data/models/user.model.dart';
import '../router/app_router.dart';
import '../storage/session_storage.dart';
import 'app_router_instance.dart';

abstract final class AuthRouteResolver {
  static Future<void> openForUser(UserModel user) {
    if (user.verificationStatus != 'approved') {
      return appRouter.replaceAll([const VerificationPendingRoute()]);
    }
    return openMainShell();
  }

  static Future<void> openSavedSession() {
    final session = GetIt.I<SessionStorage>();
    if (!session.isApproved) {
      return appRouter.replaceAll([const VerificationPendingRoute()]);
    }
    return openMainShell();
  }

  static Future<void> openMainShell() {
    return appRouter.replaceAll([
      MainShellRoute(
        children: [
          homeTab(children: [const HomeRoute()]),
        ],
      ),
    ]);
  }
}
