import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../../../../core/location/device_location_service.dart';
import '../../../../core/navigation/app_router_instance.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../../core/utils/app_toast.dart';
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
