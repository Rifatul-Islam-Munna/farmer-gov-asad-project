enum UserRole {
  farmer,
  buyer,
  agent,
  medicineSeller;

  String get apiValue {
    return switch (this) {
      UserRole.farmer => 'farmer',
      UserRole.buyer => 'buyer',
      UserRole.agent => 'agent',
      UserRole.medicineSeller => 'medicineSeller',
    };
  }

  String get label {
    return switch (this) {
      UserRole.farmer => 'Farmer',
      UserRole.buyer => 'Buyer',
      UserRole.agent => 'Agent',
      UserRole.medicineSeller => 'Medicine seller',
    };
  }

  String get helperText {
    return switch (this) {
      UserRole.farmer => 'Manage crops, sell goods and monitor market prices.',
      UserRole.buyer => 'Discover goods and make verified marketplace deals.',
      UserRole.agent => 'Create and assist farmer accounts with OTP approval.',
      UserRole.medicineSeller => 'List agricultural medicines and shop stock.',
    };
  }
}
