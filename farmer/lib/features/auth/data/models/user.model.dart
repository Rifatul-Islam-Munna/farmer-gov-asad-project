enum UserRole {
  admin,
  agent,
  farmer,
  buyer,
  medicineSeller,
}

UserRole _userRoleFromJson(Object? value) {
  final role = value?.toString();
  return UserRole.values.firstWhere(
    (item) => item.name == role,
    orElse: () => UserRole.farmer,
  );
}

class UserModel {
  const UserModel({
    required this.id,
    required this.name,
    required this.phoneNumber,
    required this.role,
    this.email,
    this.landAmount,
    this.documents = const <String>[],
    this.businessName,
    this.shopName,
    this.address,
    this.verificationStatus = 'approved',
  });

  final String id;
  final String name;
  final String phoneNumber;
  final UserRole role;
  final String? email;
  final double? landAmount;
  final List<String> documents;
  final String? businessName;
  final String? shopName;
  final String? address;
  final String verificationStatus;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final documents = json['documents'];
    return UserModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: json['name'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      role: _userRoleFromJson(json['role']),
      email: json['email'] as String?,
      landAmount: (json['landAmount'] as num?)?.toDouble(),
      documents: documents is List
          ? documents.map((item) => item.toString()).toList(growable: false)
          : const <String>[],
      businessName: json['businessName'] as String?,
      shopName: json['shopName'] as String?,
      address: json['address'] as String?,
      verificationStatus:
          json['verificationStatus'] as String? ?? 'approved',
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name,
        'phoneNumber': phoneNumber,
        'role': role.name,
        if (email != null) 'email': email,
        if (landAmount != null) 'landAmount': landAmount,
        'documents': documents,
        if (businessName != null) 'businessName': businessName,
        if (shopName != null) 'shopName': shopName,
        if (address != null) 'address': address,
        'verificationStatus': verificationStatus,
      };
}
