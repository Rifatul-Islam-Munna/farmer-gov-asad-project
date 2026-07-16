import 'user.model.dart';

class AuthResponseModel {
  const AuthResponseModel({
    required this.message,
    required this.accessToken,
    required this.user,
  });

  final String message;
  final String accessToken;
  final UserModel user;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    final userJson = json['user'];
    return AuthResponseModel(
      message: json['message'] as String? ?? '',
      accessToken: (json['access_token'] ?? json['accessToken'] ?? '')
          .toString(),
      user: UserModel.fromJson(
        userJson is Map<String, dynamic> ? userJson : const <String, dynamic>{},
      ),
    );
  }

  Map<String, dynamic> toJson() => {
    'message': message,
    'access_token': accessToken,
    'user': user.toJson(),
  };
}
