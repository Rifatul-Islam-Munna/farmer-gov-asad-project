import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../main.dart' show getIt;
import '../models/app_user.dart';

class UserStorage {
  UserStorage._();

  static const _tokenKey = 'auth_token';
  static const _userKey = 'current_user';

  static SharedPreferences get _prefs => getIt<SharedPreferences>();
  static FlutterSecureStorage get _secure => getIt<FlutterSecureStorage>();

  static Future<void> saveToken(String token) {
    return _secure.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() {
    return _secure.read(key: _tokenKey);
  }

  static Future<void> saveUser(AppUser user) {
    return _prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  static AppUser? getUser() {
    final raw = _prefs.getString(_userKey);
    if (raw == null || raw.isEmpty) return null;
    return AppUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  static Future<bool> hasSession() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  static Future<void> clear() async {
    await _secure.delete(key: _tokenKey);
    await _prefs.remove(_userKey);
  }
}
