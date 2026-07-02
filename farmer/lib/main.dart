import 'package:cached_query/cached_query.dart';
import 'package:cached_query_flutter/cached_query_flutter.dart';
import 'package:cached_storage/cached_storage.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:logger/logger.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/navigation/app_router_instance.dart';
import 'core/network/network_client.dart';
import 'core/network/typed_failure_interceptor.dart';
import 'core/storage/session_storage.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/app_toast.dart';

// Build release APK:
// flutter build apk --no-tree-shake-icons --release
final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 1,
    errorMethodCount: 5,
    colors: true,
    printEmojis: true,
  ),
);

final getIt = GetIt.instance;

Future<void> setupLocator() async {
  final preferences = await SharedPreferences.getInstance();
  const secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  getIt.registerSingleton<SharedPreferences>(preferences);
  getIt.registerSingleton<FlutterSecureStorage>(secureStorage);
  getIt.registerSingleton<SessionStorage>(
    SessionStorage(
      preferences: preferences,
      secureStorage: secureStorage,
    ),
  );

  if (kDebugMode) {
    logger.i('Services ready');
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await setupLocator();
  await dotenv.load(fileName: '.env');
  DioHelper.init();
  DioHelper.dio.interceptors.add(TypedFailureInterceptor());

  CachedQuery.instance.configFlutter(
    config: GlobalQueryConfigFlutter(
      refetchOnConnection: true,
      refetchOnResume: true,
    ),
    storage: await CachedStorage.ensureInitialized(),
  );

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  final oneSignalAppId = dotenv.env['ONESIGNAL_APP_ID'];
  if (oneSignalAppId != null && oneSignalAppId.trim().isNotEmpty) {
    if (kDebugMode) {
      OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
    }
    OneSignal.initialize(oneSignalAppId.trim());
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      scaffoldMessengerKey: AppToast.messengerKey,
      routerConfig: appRouter.config(),
      title: 'Farmer Government',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
    );
  }
}
