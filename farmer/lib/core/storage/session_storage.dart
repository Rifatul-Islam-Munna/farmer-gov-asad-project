import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SessionStorage {
  SessionStorage({
    required SharedPreferences preferences,
    required FlutterSecureStorage secureStorage,
  })  : _preferences = preferences,
        _secureStorage = secureStorage;

  static const _tokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _roleKey = 'user_role';
  static const _rolesKey = 'user_roles';
  static const _nameKey = 'user_name';
  static const _statusKey = 'account_status';

  final SharedPreferences _preferences;
  final FlutterSecureStorage _secureStorage;

  Future<String?> getToken() => _secureStorage.read(key: _tokenKey);
  Future<String?> getRefreshToken() =>
      _secureStorage.read(key: _refreshTokenKey);

  Future<bool> hasSession() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> saveSession({
    required String token,
    required String refreshToken,
    required String role,
    required List<String> roles,
    required String name,
    required String status,
  }) async {
    await _secureStorage.write(key: _tokenKey, value: token);
    await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
    await saveProfile(
      role: role,
      roles: roles,
      name: name,
      status: status,
    );
  }

  Future<void> updateTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _secureStorage.write(key: _tokenKey, value: accessToken);
    await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<void> saveProfile({
    required String role,
    required List<String> roles,
    required String name,
    required String status,
  }) async {
    await _preferences.setString(_roleKey, role);
    await _preferences.setStringList(_rolesKey, roles);
    await _preferences.setString(_nameKey, name);
    await _preferences.setString(_statusKey, status);
  }

  String get role => _preferences.getString(_roleKey) ?? 'farmer';
  List<String> get roles {
    final values = _preferences.getStringList(_rolesKey);
    return values == null || values.isEmpty ? <String>[role] : values;
  }

  String get name => _preferences.getString(_nameKey) ?? 'Farmer';
  String get status => _preferences.getString(_statusKey) ?? 'approved';
  bool get isApproved => status == 'approved';

  Future<void> setActiveRole(String role) async {
    await _preferences.setString(_roleKey, role);
  }

  Future<void> clear() async {
    await _secureStorage.delete(key: _tokenKey);
    await _secureStorage.delete(key: _refreshTokenKey);
    await _preferences.remove(_roleKey);
    await _preferences.remove(_rolesKey);
    await _preferences.remove(_nameKey);
    await _preferences.remove(_statusKey);
  }
}
