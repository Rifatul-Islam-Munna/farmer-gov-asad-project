enum UserRole { admin, agent, farmer, buyer, medicineSeller }

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
  });

  final String id;
  final String name;
  final String phoneNumber;
  final UserRole role;
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

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final documents = json['documents'];
    final location = json['location'];
    final locationMap = location is Map
        ? Map<String, dynamic>.from(location)
        : const <String, dynamic>{};
    return UserModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: json['name'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      role: _userRoleFromJson(json['role']),
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
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'phoneNumber': phoneNumber,
    'role': role.name,
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
  };
}
