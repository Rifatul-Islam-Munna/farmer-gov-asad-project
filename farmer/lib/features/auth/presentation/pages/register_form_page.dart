import 'package:farmer/core/widgets/glass_card.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/navigation/auth_route_resolver.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/app_toast.dart';
import '../../data/datasources/auth_api.dart';
import '../../data/datasources/document_upload_api.dart';
import '../../data/models/register_request.model.dart';
import '../../data/models/user.model.dart';

@RoutePage()
class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _land = TextEditingController();
  final _business = TextEditingController();
  final _shop = TextEditingController();
  final _address = TextEditingController();
  final _documents = <String>[];
  UserRole _role = UserRole.farmer;
  bool _busy = false;
  bool _uploading = false;
  bool _obscure = true;

  bool get _needsDocuments =>
      _role == UserRole.agent ||
      _role == UserRole.buyer ||
      _role == UserRole.medicineSeller;

  @override
  void dispose() {
    for (final controller in [
      _name,
      _phone,
      _password,
      _land,
      _business,
      _shop,
      _address,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _addDocument() async {
    final file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 82,
      maxWidth: 1800,
    );
    if (file == null) return;
    setState(() => _uploading = true);
    try {
      final url = await DocumentUploadApi().upload(file);
      setState(() => _documents.add(url));
      AppToast.show('Document uploaded successfully.');
    } catch (error) {
      AppToast.show(error.toString());
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_needsDocuments && _documents.isEmpty) {
      AppToast.show('Upload at least one identity or business document.');
      return;
    }

    setState(() => _busy = true);
    try {
      final response = await AuthApi().register(
        RegisterRequestModel(
          name: _name.text.trim(),
          phoneNumber: _phone.text.trim(),
          password: _password.text,
          role: _role,
          landAmount: _role == UserRole.farmer
              ? double.tryParse(_land.text)
              : null,
          documents: List.unmodifiable(_documents),
          businessName: _role == UserRole.buyer
              ? _optional(_business.text)
              : null,
          shopName: _role == UserRole.medicineSeller
              ? _optional(_shop.text)
              : null,
          address: _role == UserRole.agent || _role == UserRole.medicineSeller
              ? _optional(_address.text)
              : null,
        ),
      );
      AppToast.show(
        _role == UserRole.farmer
            ? 'Farmer account created successfully.'
            : 'Account submitted for verification.',
      );
      await AuthRouteResolver.openForUser(response.user);
    } catch (error) {
      AppToast.show(error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String? _optional(String value) {
    final text = value.trim();
    return text.isEmpty ? null : text;
  }

  @override
  Widget build(BuildContext context) {
    const roles = [
      UserRole.farmer,
      UserRole.buyer,
      UserRole.agent,
      UserRole.medicineSeller,
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            const Text(
              'Choose your role',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: roles
                  .map(
                    (role) => ChoiceChip(
                      selected: _role == role,
                      avatar: Icon(_roleIcon(role), size: 18),
                      label: Text(_roleLabel(role)),
                      onSelected: (_) => setState(() {
                        _role = role;
                        _documents.clear();
                      }),
                    ),
                  )
                  .toList(growable: false),
            ),
            const SizedBox(height: 18),
            _field(_name, 'Full name', Icons.person_outline),
            const SizedBox(height: 12),
            _field(
              _phone,
              'Phone number',
              Icons.phone_outlined,
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _password,
              obscureText: _obscure,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  onPressed: () => setState(() => _obscure = !_obscure),
                  icon: Icon(
                    _obscure
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                  ),
                ),
              ),
              validator: (value) => value == null || value.length < 6
                  ? 'Use at least 6 characters'
                  : null,
            ),
            if (_role == UserRole.farmer) ...[
              const SizedBox(height: 12),
              _field(
                _land,
                'Land amount in acres',
                Icons.landscape_outlined,
                keyboardType: TextInputType.number,
                number: true,
              ),
            ],
            if (_role == UserRole.buyer) ...[
              const SizedBox(height: 12),
              _field(
                _business,
                'Business name (optional)',
                Icons.business_outlined,
                optional: true,
              ),
            ],
            if (_role == UserRole.agent ||
                _role == UserRole.medicineSeller) ...[
              const SizedBox(height: 12),
              _field(
                _address,
                _role == UserRole.agent ? 'Service address' : 'Shop address',
                Icons.location_on_outlined,
              ),
            ],
            if (_role == UserRole.medicineSeller) ...[
              const SizedBox(height: 12),
              _field(_shop, 'Shop name', Icons.storefront_outlined),
            ],
            if (_needsDocuments) ...[
              const SizedBox(height: 18),
              GlassCard(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Verification documents',
                        style: TextStyle(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 8),
                      ..._documents.asMap().entries.map(
                        (entry) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: const Icon(
                            Icons.verified_outlined,
                            color: AppColors.primary,
                          ),
                          title: Text(
                            entry.value,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          trailing: IconButton(
                            onPressed: () =>
                                setState(() => _documents.removeAt(entry.key)),
                            icon: const Icon(Icons.delete_outline),
                          ),
                        ),
                      ),
                      OutlinedButton.icon(
                        onPressed: _uploading ? null : _addDocument,
                        icon: _uploading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.upload_file_rounded),
                        label: Text(
                          _uploading ? 'Uploading...' : 'Upload document',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 22),
            FilledButton.icon(
              onPressed: _busy || _uploading ? null : _submit,
              icon: const Icon(Icons.person_add_alt_1_rounded),
              label: Text(_busy ? 'Creating account...' : 'Create account'),
            ),
            TextButton(
              onPressed: () => context.router.maybePop(),
              child: const Text('Already have an account? Sign in'),
            ),
          ],
        ),
      ),
    );
  }

  TextFormField _field(
    TextEditingController controller,
    String label,
    IconData icon, {
    TextInputType? keyboardType,
    bool optional = false,
    bool number = false,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
      validator: (value) {
        if (optional) return null;
        if (value == null || value.trim().isEmpty) return 'Required';
        if (number && double.tryParse(value) == null) return 'Enter a number';
        return null;
      },
    );
  }

  String _roleLabel(UserRole role) => switch (role) {
    UserRole.farmer => 'Farmer',
    UserRole.buyer => 'Buyer',
    UserRole.agent => 'Agent',
    UserRole.medicineSeller => 'Medicine seller',
    UserRole.admin => 'Admin',
  };

  IconData _roleIcon(UserRole role) => switch (role) {
    UserRole.farmer => Icons.agriculture_outlined,
    UserRole.buyer => Icons.shopping_basket_outlined,
    UserRole.agent => Icons.support_agent_outlined,
    UserRole.medicineSeller => Icons.medical_services_outlined,
    UserRole.admin => Icons.admin_panel_settings_outlined,
  };
}
