import '../../features/auth/data/models/user.model.dart';
import '../router/app_router.dart';
import 'app_router_instance.dart';

abstract final class AuthRouteResolver {
  static Future<void> openForUser(UserModel user) {
    return openMainShell();
  }

  static Future<void> openSavedSession() {
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
