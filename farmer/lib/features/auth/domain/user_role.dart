import '../data/models/user.model.dart';

extension UserRolePresentation on UserRole {
  String get label {
    return switch (this) {
      UserRole.admin => 'Admin',
      UserRole.farmer => 'Farmer',
      UserRole.buyer => 'Buyer',
      UserRole.agent => 'Agent',
      UserRole.medicineSeller => 'Medicine seller',
    };
  }

  String get helperText {
    return switch (this) {
      UserRole.admin => 'Manage the Farmer Government platform.',
      UserRole.farmer => 'Manage crops, sell goods and monitor market prices.',
      UserRole.buyer => 'Discover goods and make verified marketplace deals.',
      UserRole.agent => 'Create and assist farmer accounts with OTP approval.',
      UserRole.medicineSeller => 'List agricultural medicines and shop stock.',
    };
  }
}
