import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../../../core/location/device_location_service.dart';
import '../../../../core/navigation/app_router_instance.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../../core/utils/app_toast.dart';
import '../../../auth/data/datasources/account_security_api.dart';
import '../../../auth/data/datasources/auth_api.dart';
import '../../../auth/data/datasources/profile_api.dart';
import '../../../auth/data/models/user.model.dart';

@RoutePage(name: 'ProfileRoute')
class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _gender = TextEditingController();
  final _land = TextEditingController();
  final _business = TextEditingController();
  final _shop = TextEditingController();
  final _address = TextEditingController();

  UserModel? _user;
  bool _loading = true;
  bool _saving = false;
  bool _savingLocation = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final controller in [
      _name,
      _phone,
      _email,
      _gender,
      _land,
      _business,
      _shop,
      _address,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final user = await ProfileApi().getMyProfile();
      if (!mounted) return;
      _apply(user);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _apply(UserModel user) {
    _user = user;
    _name.text = user.name;
    _phone.text = user.phoneNumber;
    _email.text = user.email ?? '';
    _gender.text = user.gender ?? '';
    _land.text = user.landAmount?.toString() ?? '';
    _business.text = user.businessName ?? '';
    _shop.text = user.shopName ?? '';
    _address.text = user.address ?? '';
    setState(() {});
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final data = <String, dynamic>{
        'name': _name.text.trim(),
        'phoneNumber': _phone.text.trim(),
        if (_email.text.trim().isNotEmpty) 'email': _email.text.trim(),
        if (_gender.text.trim().isNotEmpty) 'gender': _gender.text.trim(),
        if (_land.text.trim().isNotEmpty)
          'landAmount': double.parse(_land.text.trim()),
        'businessName': _business.text.trim(),
        'shopName': _shop.text.trim(),
        'address': _address.text.trim(),
      };
      final user = await ProfileApi().updateProfile(data);
      if (!mounted) return;
      _apply(user);
      AppToast.show('Profile updated successfully.');
    } catch (error) {
      AppToast.show(error.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _refreshLocation() async {
    setState(() => _savingLocation = true);
    try {
      final position = await DeviceLocationService.currentPosition();
      final user = await ProfileApi().updateLocation(
        latitude: position.latitude,
        longitude: position.longitude,
      );
      if (!mounted) return;
      _apply(user);
      AppToast.show('Current location saved.');
    } catch (error) {
      AppToast.show(error.toString().replaceFirst('Bad state: ', ''));
    } finally {
      if (mounted) setState(() => _savingLocation = false);
    }
  }

  Future<void> _verifyPhone() async {
    try {
      final response = await AccountSecurityApi().requestPhoneVerification();
      if (!mounted) return;
      final code = TextEditingController();
      final developmentCode = response['developmentCode']?.toString();
      final confirmed = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Verify phone number'),
          content: TextField(
            controller: code,
            keyboardType: TextInputType.number,
            maxLength: 6,
            decoration: InputDecoration(
              labelText: '6-digit code',
              helperText: developmentCode == null
                  ? 'Enter the code sent to your phone.'
                  : 'Development code: $developmentCode',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                if (code.text.trim().length != 6) return;
                try {
                  await AccountSecurityApi()
                      .confirmPhoneVerification(code.text.trim());
                  if (context.mounted) Navigator.pop(context, true);
                } catch (error) {
                  AppToast.error(error.toString());
                }
              },
              child: const Text('Verify'),
            ),
          ],
        ),
      );
      code.dispose();
      if (confirmed == true) {
        AppToast.success('Phone number verified successfully.');
        await _load();
      }
    } catch (error) {
      AppToast.error(error.toString());
    }
  }

  Future<void> _switchRole() async {
    final user = _user;
    if (user == null || user.roles.length < 2) return;
    var selected = user.role;
    final changed = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Switch active workspace'),
          content: DropdownButtonFormField<UserRole>(
            initialValue: selected,
            decoration: const InputDecoration(labelText: 'Approved role'),
            items: user.roles
                .map(
                  (role) => DropdownMenuItem(
                    value: role,
                    child: Text(_roleLabel(role)),
                  ),
                )
                .toList(growable: false),
            onChanged: (value) {
              if (value != null) setDialogState(() => selected = value);
            },
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: selected == user.role
                  ? null
                  : () => Navigator.pop(context, true),
              child: const Text('Switch and sign in again'),
            ),
          ],
        ),
      ),
    );
    if (changed != true) return;
    try {
      await AccountSecurityApi().changeActiveRole(selected.name);
      AppToast.success('Workspace changed. Sign in again to continue.');
      await appRouter.replaceAll([const LoginRoute()]);
    } catch (error) {
      AppToast.error(error.toString());
    }
  }

  Future<void> _submitProfessionalReview() async {
    final user = _user;
    if (user == null) return;
    final professionalRoles = <UserRole>{
      UserRole.agent,
      UserRole.agricultureSpecialist,
      UserRole.veterinaryDoctor,
      UserRole.seller,
      UserRole.machinerySeller,
      UserRole.medicineSeller,
    };
    final eligibleRoles = user.roles
        .where(professionalRoles.contains)
        .toList(growable: false);
    if (eligibleRoles.isEmpty) {
      AppToast.warning('This account has no professional role to review.');
      return;
    }

    var selectedRole = eligibleRoles.contains(user.role)
        ? user.role
        : eligibleRoles.first;
    final identityUrl = TextEditingController();
    final credentialUrl = TextEditingController();
    final licenseUrl = TextEditingController();
    var identityConfirmed = false;
    var credentialConfirmed = false;
    var businessConfirmed = false;

    final submitted = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Submit professional review'),
          content: SizedBox(
            width: 520,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<UserRole>(
                    initialValue: selectedRole,
                    decoration: const InputDecoration(labelText: 'Role'),
                    items: eligibleRoles
                        .map(
                          (role) => DropdownMenuItem(
                            value: role,
                            child: Text(_roleLabel(role)),
                          ),
                        )
                        .toList(growable: false),
                    onChanged: (value) {
                      if (value != null) {
                        setDialogState(() => selectedRole = value);
                      }
                    },
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: identityUrl,
                    decoration: const InputDecoration(
                      labelText: 'Identity document URL',
                      prefixIcon: Icon(Icons.badge_outlined),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: credentialUrl,
                    decoration: const InputDecoration(
                      labelText: 'Certificate or credential URL',
                      prefixIcon: Icon(Icons.workspace_premium_outlined),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: licenseUrl,
                    decoration: const InputDecoration(
                      labelText: 'License or business document URL',
                      prefixIcon: Icon(Icons.approval_outlined),
                    ),
                  ),
                  CheckboxListTile(
                    value: identityConfirmed,
                    onChanged: (value) => setDialogState(
                      () => identityConfirmed = value ?? false,
                    ),
                    title: const Text('Identity matches the account holder'),
                    contentPadding: EdgeInsets.zero,
                  ),
                  CheckboxListTile(
                    value: credentialConfirmed,
                    onChanged: (value) => setDialogState(
                      () => credentialConfirmed = value ?? false,
                    ),
                    title: const Text('Credentials are current and genuine'),
                    contentPadding: EdgeInsets.zero,
                  ),
                  CheckboxListTile(
                    value: businessConfirmed,
                    onChanged: (value) => setDialogState(
                      () => businessConfirmed = value ?? false,
                    ),
                    title: const Text('Business/service information is accurate'),
                    contentPadding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                if (identityUrl.text.trim().isEmpty ||
                    credentialUrl.text.trim().isEmpty ||
                    licenseUrl.text.trim().isEmpty ||
                    !identityConfirmed ||
                    !credentialConfirmed ||
                    !businessConfirmed) {
                  AppToast.warning(
                    'Add all required document URLs and complete the checklist.',
                  );
                  return;
                }
                Navigator.pop(context, true);
              },
              child: const Text('Submit review'),
            ),
          ],
        ),
      ),
    );

    if (submitted == true) {
      try {
        await AccountSecurityApi().submitProfessionalReview(
          role: selectedRole.name,
          documents: [
            {
              'key': 'identity',
              'label': 'Identity document',
              'url': identityUrl.text.trim(),
            },
            {
              'key': 'credential',
              'label': 'Professional credential',
              'url': credentialUrl.text.trim(),
            },
            {
              'key': 'license',
              'label': 'License or business document',
              'url': licenseUrl.text.trim(),
            },
          ],
          checklist: {
            'identityConfirmed': identityConfirmed,
            'credentialConfirmed': credentialConfirmed,
            'businessInformationConfirmed': businessConfirmed,
          },
        );
        AppToast.success('Professional review package submitted.');
      } catch (error) {
        AppToast.error(error.toString());
      }
    }
    identityUrl.dispose();
    credentialUrl.dispose();
    licenseUrl.dispose();
  }

  String _roleLabel(UserRole role) {
    final source = role.name.replaceAllMapped(
      RegExp(r'([A-Z])'),
      (match) => ' ${match.group(1)}',
    );
    return source[0].toUpperCase() + source.substring(1);
  }

  Future<void> _signOut() async {
    await AuthApi().logout();
    await appRouter.replaceAll([const LoginRoute()]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_error!, textAlign: TextAlign.center),
                    const SizedBox(height: 14),
                    FilledButton(
                      onPressed: _load,
                      child: const Text('Try again'),
                    ),
                  ],
                ),
              ),
            )
          : _profileForm(),
    );
  }

  Widget _profileForm() {
    final user = _user!;
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          const CircleAvatar(
            radius: 42,
            child: Icon(Icons.person_rounded, size: 46),
          ),
          const SizedBox(height: 12),
          Text(
            user.role.name,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Center(
            child: Chip(
              avatar: Icon(
                user.verificationStatus == 'approved'
                    ? Icons.verified_rounded
                    : Icons.schedule_rounded,
                size: 18,
              ),
              label: Text(user.verificationStatus),
            ),
          ),
          const SizedBox(height: 16),
          GlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: (user.isOtpVerified
                              ? Colors.green
                              : Colors.orange)
                          .withValues(alpha: .12),
                      foregroundColor:
                          user.isOtpVerified ? Colors.green : Colors.orange,
                      child: Icon(
                        user.isOtpVerified
                            ? Icons.phone_iphone_rounded
                            : Icons.phone_locked_rounded,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Phone verification',
                            style: TextStyle(fontWeight: FontWeight.w800),
                          ),
                          Text(
                            user.isOtpVerified
                                ? 'Your phone number is verified.'
                                : 'Verify your number with an expiring OTP code.',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (!user.isOtpVerified)
                      TextButton(
                        onPressed: _verifyPhone,
                        child: const Text('Verify'),
                      ),
                  ],
                ),
                if (user.roles.length > 1) ...[
                  const Divider(height: 28),
                  Row(
                    children: [
                      const CircleAvatar(
                        backgroundColor: Color(0xFFEAF4E6),
                        foregroundColor: AppColors.primary,
                        child: Icon(Icons.switch_account_rounded),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Active workspace',
                              style: TextStyle(fontWeight: FontWeight.w800),
                            ),
                            Text(
                              '${_roleLabel(user.role)} • ${user.roles.length} approved roles',
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: _switchRole,
                        child: const Text('Switch'),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          if (user.roles.any(
            (role) => {
              UserRole.agent,
              UserRole.agricultureSpecialist,
              UserRole.veterinaryDoctor,
              UserRole.seller,
              UserRole.machinerySeller,
              UserRole.medicineSeller,
            }.contains(role),
          )) ...[
            const SizedBox(height: 12),
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Color(0xFFEAF4E6),
                    foregroundColor: AppColors.primary,
                    child: Icon(Icons.fact_check_outlined),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Professional verification package',
                          style: TextStyle(fontWeight: FontWeight.w800),
                        ),
                        Text(
                          'Submit identity, credential and license documents for admin review.',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  IconButton.filledTonal(
                    onPressed: _submitProfessionalReview,
                    tooltip: 'Submit documents',
                    icon: const Icon(Icons.upload_file_rounded),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 22),
          _field(
            _name,
            'Full name',
            Icons.person_outline_rounded,
            required: true,
          ),
          _field(_phone, 'Phone number', Icons.phone_outlined, required: true),
          _field(
            _email,
            'Email',
            Icons.email_outlined,
            keyboard: TextInputType.emailAddress,
          ),
          _field(_gender, 'Gender', Icons.badge_outlined),
          if (user.role == UserRole.farmer)
            _field(
              _land,
              'Land amount',
              Icons.landscape_outlined,
              keyboard: const TextInputType.numberWithOptions(decimal: true),
            ),
          if (user.role == UserRole.buyer)
            _field(_business, 'Business name', Icons.business_outlined),
          if (user.role == UserRole.medicineSeller)
            _field(_shop, 'Shop name', Icons.store_outlined),
          _field(_address, 'Address', Icons.location_on_outlined, maxLines: 2),
          const SizedBox(height: 8),
          GlassCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.white.withValues(alpha: .12),
                  foregroundColor: AppColors.primary,
                  child: Icon(Icons.my_location_rounded),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Saved location',
                        style: TextStyle(fontWeight: FontWeight.w800),
                      ),
                      Text(
                        user.latitude == null
                            ? 'No location saved yet'
                            : '${user.latitude!.toStringAsFixed(5)}, ${user.longitude!.toStringAsFixed(5)}',
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: _savingLocation ? null : _refreshLocation,
                  icon: _savingLocation
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.refresh_rounded),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: _saving ? null : _save,
            icon: _saving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.save_rounded),
            label: const Text('Save profile'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: _signOut,
            icon: const Icon(Icons.logout_rounded),
            label: const Text('Sign out'),
          ),
        ],
      ),
    );
  }

  Widget _field(
    TextEditingController controller,
    String label,
    IconData icon, {
    bool required = false,
    TextInputType? keyboard,
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboard,
        maxLines: maxLines,
        validator: required
            ? (value) => value == null || value.trim().isEmpty
                  ? '$label is required'
                  : null
            : null,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          alignLabelWithHint: maxLines > 1,
        ),
      ),
    );
  }
}
