import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SessionStorage {
  SessionStorage({
    required SharedPreferences preferences,
    required FlutterSecureStorage secureStorage,
  }) : _preferences = preferences,
       _secureStorage = secureStorage;

  static const _tokenKey = 'access_token';
  static const _roleKey = 'user_role';
  static const _nameKey = 'user_name';

  final SharedPreferences _preferences;
  final FlutterSecureStorage _secureStorage;

  Future<bool> hasSession() async {
    final token = await _secureStorage.read(key: _tokenKey);
    return token != null && token.isNotEmpty;
  }

  Future<void> saveDemoSession({
    required String role,
    required String name,
  }) async {
    await _secureStorage.write(
      key: _tokenKey,
      value: 'demo-access-token',
    );
    await _preferences.setString(_roleKey, role);
    await _preferences.setString(_nameKey, name);
  }

  String get role => _preferences.getString(_roleKey) ?? 'farmer';

  String get name => _preferences.getString(_nameKey) ?? 'Farmer';

  Future<void> clear() async {
    await _secureStorage.delete(key: _tokenKey);
    await _preferences.remove(_roleKey);
    await _preferences.remove(_nameKey);
  }
}
