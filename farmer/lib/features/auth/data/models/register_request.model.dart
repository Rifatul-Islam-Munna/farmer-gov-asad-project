import 'user.model.dart';

class RegisterRequestModel {
  const RegisterRequestModel({
    required this.name,
    required this.phoneNumber,
    required this.password,
    required this.role,
    this.email,
    this.landAmount,
    this.documents = const <String>[],
    this.businessName,
    this.shopName,
    this.address,
  });

  final String name;
  final String phoneNumber;
  final String password;
  final UserRole role;
  final String? email;
  final double? landAmount;
  final List<String> documents;
  final String? businessName;
  final String? shopName;
  final String? address;

  factory RegisterRequestModel.fromJson(Map<String, dynamic> json) {
    final documents = json['documents'];
    final roleValue = json['role']?.toString();
    return RegisterRequestModel(
      name: json['name'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      password: json['password'] as String? ?? '',
      role: UserRole.values.firstWhere(
        (item) => item.name == roleValue,
        orElse: () => UserRole.farmer,
      ),
      email: json['email'] as String?,
      landAmount: (json['landAmount'] as num?)?.toDouble(),
      documents: documents is List
          ? documents.map((item) => item.toString()).toList(growable: false)
          : const <String>[],
      businessName: json['businessName'] as String?,
      shopName: json['shopName'] as String?,
      address: json['address'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'phoneNumber': phoneNumber,
    'password': password,
    'role': role.name,
    if (email != null) 'email': email,
    if (landAmount != null) 'landAmount': landAmount,
    'documents': documents,
    if (businessName != null) 'businessName': businessName,
    if (shopName != null) 'shopName': shopName,
    if (address != null) 'address': address,
  };
}
