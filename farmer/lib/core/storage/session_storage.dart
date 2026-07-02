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
  static const _statusKey = 'account_status';

  final SharedPreferences _preferences;
  final FlutterSecureStorage _secureStorage;

  Future<String?> getToken() => _secureStorage.read(key: _tokenKey);

  Future<bool> hasSession() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> saveSession({
    required String token,
    required String role,
    required String name,
    required String status,
  }) async {
    await _secureStorage.write(key: _tokenKey, value: token);
    await saveProfile(role: role, name: name, status: status);
  }

  Future<void> saveProfile({
    required String role,
    required String name,
    required String status,
  }) async {
    await _preferences.setString(_roleKey, role);
    await _preferences.setString(_nameKey, name);
    await _preferences.setString(_statusKey, status);
  }

  String get role => _preferences.getString(_roleKey) ?? 'farmer';
  String get name => _preferences.getString(_nameKey) ?? 'Farmer';
  String get status => _preferences.getString(_statusKey) ?? 'approved';
  bool get isApproved => status == 'approved';

  Future<void> clear() async {
    await _secureStorage.delete(key: _tokenKey);
    await _preferences.remove(_roleKey);
    await _preferences.remove(_nameKey);
    await _preferences.remove(_statusKey);
  }
}
