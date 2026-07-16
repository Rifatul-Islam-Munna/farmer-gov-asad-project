class LoginRequestModel {
  const LoginRequestModel({required this.phoneNumber, required this.password});

  final String phoneNumber;
  final String password;

  factory LoginRequestModel.fromJson(Map<String, dynamic> json) {
    return LoginRequestModel(
      phoneNumber: json['phoneNumber'] as String? ?? '',
      password: json['password'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'phoneNumber': phoneNumber,
    'password': password,
  };
}
