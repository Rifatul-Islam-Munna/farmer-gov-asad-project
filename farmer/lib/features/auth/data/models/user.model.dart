enum UserRole {
  farmer,
  wholesaleBuyer,
  buyer,
  studentVolunteer,
  agent,
  agricultureSpecialist,
  veterinaryDoctor,
  seller,
  machinerySeller,
  medicineSeller,
  publicUser,
  governmentOfficer,
  support,
  admin,
  superAdmin,
}

UserRole userRoleFromJson(Object? value) {
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
    this.roles = const <UserRole>[],
    this.email,
    this.gender,
    this.landAmount,
    this.documents = const <String>[],
    this.businessName,
    this.shopName,
    this.address,
    this.latitude,
    this.longitude,
    this.locationUpdatedAt,
    this.verificationStatus = 'approved',
    this.accountStatus = 'active',
    this.isOtpVerified = false,
  });

  final String id;
  final String name;
  final String phoneNumber;
  final UserRole role;
  final List<UserRole> roles;
  final String? email;
  final String? gender;
  final double? landAmount;
  final List<String> documents;
  final String? businessName;
  final String? shopName;
  final String? address;
  final double? latitude;
  final double? longitude;
  final DateTime? locationUpdatedAt;
  final String verificationStatus;
  final String accountStatus;
  final bool isOtpVerified;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final documents = json['documents'];
    final rolesValue = json['roles'];
    final location = json['location'];
    final locationMap = location is Map
        ? Map<String, dynamic>.from(location)
        : const <String, dynamic>{};
    final activeRole = userRoleFromJson(json['role']);
    return UserModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: json['name'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      role: activeRole,
      roles: rolesValue is List
          ? rolesValue.map(userRoleFromJson).toSet().toList(growable: false)
          : <UserRole>[activeRole],
      email: json['email'] as String?,
      gender: json['gender'] as String?,
      landAmount: (json['landAmount'] as num?)?.toDouble(),
      documents: documents is List
          ? documents.map((item) => item.toString()).toList(growable: false)
          : const <String>[],
      businessName: json['businessName'] as String?,
      shopName: json['shopName'] as String?,
      address: json['address'] as String?,
      latitude: (locationMap['latitude'] as num?)?.toDouble(),
      longitude: (locationMap['longitude'] as num?)?.toDouble(),
      locationUpdatedAt: DateTime.tryParse(
        locationMap['updatedAt']?.toString() ?? '',
      ),
      verificationStatus: json['verificationStatus'] as String? ?? 'approved',
      accountStatus: json['accountStatus'] as String? ?? 'active',
      isOtpVerified: json['isOtpVerified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name,
        'phoneNumber': phoneNumber,
        'role': role.name,
        'roles': roles.map((item) => item.name).toList(growable: false),
        if (email != null) 'email': email,
        if (gender != null) 'gender': gender,
        if (landAmount != null) 'landAmount': landAmount,
        'documents': documents,
        if (businessName != null) 'businessName': businessName,
        if (shopName != null) 'shopName': shopName,
        if (address != null) 'address': address,
        if (latitude != null && longitude != null)
          'location': {
            'latitude': latitude,
            'longitude': longitude,
            if (locationUpdatedAt != null)
              'updatedAt': locationUpdatedAt!.toIso8601String(),
          },
        'verificationStatus': verificationStatus,
        'accountStatus': accountStatus,
        'isOtpVerified': isOtpVerified,
      };
}
