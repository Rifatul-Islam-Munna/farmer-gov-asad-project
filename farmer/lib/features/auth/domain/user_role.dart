import '../data/models/user.model.dart';

extension UserRolePresentation on UserRole {
  String get label {
    final source = name.replaceAllMapped(
      RegExp(r'([A-Z])'),
      (match) => ' ${match.group(1)}',
    );
    return source[0].toUpperCase() + source.substring(1);
  }

  String get helperText {
    return switch (this) {
      UserRole.farmer =>
        'Manage crops, sell goods and monitor market prices.',
      UserRole.wholesaleBuyer =>
        'Source agricultural products in bulk and manage procurement.',
      UserRole.buyer =>
        'Discover goods and make verified marketplace deals.',
      UserRole.studentVolunteer =>
        'Support approved community and farmer-assistance activities.',
      UserRole.agent =>
        'Create and assist farmer accounts with OTP approval.',
      UserRole.agricultureSpecialist =>
        'Review crop cases and provide verified agricultural guidance.',
      UserRole.veterinaryDoctor =>
        'Review livestock and poultry health cases.',
      UserRole.seller =>
        'Manage an agricultural storefront, products and orders.',
      UserRole.machinerySeller =>
        'Sell, rent and service agricultural machinery.',
      UserRole.medicineSeller =>
        'List agricultural medicines, inputs and shop stock.',
      UserRole.publicUser =>
        'Browse public agricultural information and services.',
      UserRole.governmentOfficer =>
        'Monitor regional services, risks and agricultural operations.',
      UserRole.support =>
        'Resolve user and marketplace support cases.',
      UserRole.admin => 'Manage the Farmer Government platform.',
      UserRole.superAdmin =>
        'Manage platform-wide security, roles and administration.',
    };
  }
}
