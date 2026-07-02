class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    required this.phoneNumber,
    required this.role,
    this.email,
    this.landAmount,
    this.documents = const [],
  });

  final String id;
  final String name;
  final String phoneNumber;
  final String role;
  final String? email;
  final double? landAmount;
  final List<String> documents;

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      phoneNumber: (json['phoneNumber'] ?? '').toString(),
      role: (json['role'] ?? 'farmer').toString(),
      email: json['email']?.toString(),
      landAmount: (json['landAmount'] as num?)?.toDouble(),
      documents: (json['documents'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(growable: false),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phoneNumber': phoneNumber,
      'role': role,
      'email': email,
      'landAmount': landAmount,
      'documents': documents,
    };
  }
}
