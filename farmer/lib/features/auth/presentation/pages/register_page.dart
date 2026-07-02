import 'package:auto_route/auto_route.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/navigation/app_router_instance.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/app_toast.dart';
import '../../data/datasources/auth_api.dart';
import '../../data/models/register_request.model.dart';
import '../../data/models/user.model.dart';
import '../../domain/user_role.dart';

@RoutePage()
class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _landController = TextEditingController();
  final _businessController = TextEditingController();
  final _shopController = TextEditingController();
  final _addressController = TextEditingController();
  final _picker = ImagePicker();

  UserRole _selectedRole = UserRole.farmer;
  final List<String> _documents = [];
  bool _loading = false;
  bool _obscurePassword = true;

  bool get _needsDocuments =>
      _selectedRole == UserRole.agent ||
      _selectedRole == UserRole.buyer ||
      _selectedRole == UserRole.medicineSeller;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _landController.dispose();
    _businessController.dispose();
    _shopController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _pickDocument() async {
    final image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 82,
    );
    if (image == null || !mounted) return;

    setState(() => _documents.add(image.path));
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_needsDocuments && _documents.isEmpty) {
      AppToast.show('Add at least one identity or business document.');
      return;
    }

    setState(() => _loading = true);
    try {
      await AuthApi().register(
        RegisterRequestModel(
          name: _nameController.text.trim(),
          phoneNumber: _phoneController.text.trim(),
          password: _passwordController.text,
          role: _selectedRole,
          landAmount: _selectedRole == UserRole.farmer
              ? double.tryParse(_landController.text.trim())
              : null,
          documents: List.unmodifiable(_documents),
          businessName: _selectedRole == UserRole.buyer
              ? _emptyToNull(_businessController.text)
              : null,
          shopName: _selectedRole == UserRole.medicineSeller
              ? _emptyToNull(_shopController.text)
              : null,
          address: _selectedRole == UserRole.agent ||
                  _selectedRole == UserRole.medicineSeller
              ? _emptyToNull(_addressController.text)
              : null,
        ),
      );

      AppToast.show(
        _selectedRole == UserRole.farmer
            ? 'Farmer account created successfully.'
            : 'Account submitted for verification.',
      );

      await appRouter.replaceAll([
        MainShellRoute(
          children: [
            homeTab(children: [const HomeRoute()]),
          ],
        ),
      ]);
    } catch (error) {
      AppToast.show(_messageFromError(error));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String? _emptyToNull(String value) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  String _messageFromError(Object error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['message'] != null) {
        final message = data['message'];
        if (message is List) return message.join('\n');
        return message.toString();
      }
    }
    return 'Unable to create the account. Please try again.';
  }

  IconData _roleIcon(UserRole role) {
    return switch (role) {
      UserRole.admin => Icons.admin_panel_settings_outlined,
      UserRole.farmer => Icons.agriculture_outlined,
      UserRole.buyer => Icons.shopping_basket_outlined,
      UserRole.agent => Icons.support_agent_outlined,
      UserRole.medicineSeller => Icons.medical_services_outlined,
    };
  }

  @override
  Widget build(BuildContext context) {
    const publicRoles = [
      UserRole.farmer,
      UserRole.buyer,
      UserRole.agent,
      UserRole.medicineSeller,
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            children: [
              const Text(
                'Choose your role',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'We will show the information required for your account type.',
                style: TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 18),
              ...publicRoles.map(
                (role) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _RoleCard(
                    role: role,
                    icon: _roleIcon(role),
                    selected: _selectedRole == role,
                    onTap: () {
                      setState(() {
                        _selectedRole = role;
                        _documents.clear();
                      });
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Full name',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (value) {
                  if (value == null || value.trim().length < 2) {
                    return 'Enter your full name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Phone number',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Enter your phone number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                    ),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              if (_selectedRole == UserRole.farmer) ...[
                const SizedBox(height: 14),
                TextFormField(
                  controller: _landController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'Land amount (acres)',
                    prefixIcon: Icon(Icons.landscape_outlined),
                    helperText: 'Enter the total land you currently farm.',
                  ),
                  validator: (value) {
                    final amount = double.tryParse(value?.trim() ?? '');
                    if (amount == null || amount < 0) {
                      return 'Enter a valid land amount';
                    }
                    return null;
                  },
                ),
              ],
              if (_selectedRole == UserRole.buyer) ...[
                const SizedBox(height: 14),
                TextFormField(
                  controller: _businessController,
                  decoration: const InputDecoration(
                    labelText: 'Business name (optional)',
                    prefixIcon: Icon(Icons.business_outlined),
                  ),
                ),
              ],
              if (_selectedRole == UserRole.agent ||
                  _selectedRole == UserRole.medicineSeller) ...[
                const SizedBox(height: 14),
                TextFormField(
                  controller: _addressController,
                  decoration: InputDecoration(
                    labelText: _selectedRole == UserRole.agent
                        ? 'Service area or address'
                        : 'Shop address',
                    prefixIcon: const Icon(Icons.location_on_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Enter the required address';
                    }
                    return null;
                  },
                ),
              ],
              if (_selectedRole == UserRole.medicineSeller) ...[
                const SizedBox(height: 14),
                TextFormField(
                  controller: _shopController,
                  decoration: const InputDecoration(
                    labelText: 'Shop name',
                    prefixIcon: Icon(Icons.storefront_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Enter the shop name';
                    }
                    return null;
                  },
                ),
              ],
              if (_needsDocuments) ...[
                const SizedBox(height: 18),
                _DocumentPicker(
                  documents: _documents,
                  onAdd: _pickDocument,
                  onRemove: (index) {
                    setState(() => _documents.removeAt(index));
                  },
                ),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Create account'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.router.maybePop(),
                child: const Text('Already have an account? Sign in'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.role,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final UserRole role;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? const Color(0xFFE7F3E3) : Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: selected ? AppColors.primary : AppColors.border,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: selected
                    ? AppColors.primary
                    : const Color(0xFFF0F5ED),
                foregroundColor:
                    selected ? Colors.white : AppColors.primaryDark,
                child: Icon(icon),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      role.label,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      role.helperText,
                      style: const TextStyle(
                        fontSize: 12,
                        height: 1.35,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                selected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_off,
                color: selected ? AppColors.primary : AppColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DocumentPicker extends StatelessWidget {
  const _DocumentPicker({
    required this.documents,
    required this.onAdd,
    required this.onRemove,
  });

  final List<String> documents;
  final VoidCallback onAdd;
  final ValueChanged<int> onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.description_outlined, color: AppColors.primary),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Identity or business documents',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Add a clear image. The upload API will replace the local path in the next document feature.',
            style: TextStyle(
              fontSize: 12,
              height: 1.35,
              color: AppColors.textSecondary,
            ),
          ),
          if (documents.isNotEmpty) ...[
            const SizedBox(height: 12),
            ...List.generate(
              documents.length,
              (index) => ListTile(
                contentPadding: EdgeInsets.zero,
                dense: true,
                leading: const Icon(Icons.image_outlined),
                title: Text(
                  'Document ${index + 1}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                trailing: IconButton(
                  onPressed: () => onRemove(index),
                  icon: const Icon(Icons.close_rounded),
                ),
              ),
            ),
          ],
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add_photo_alternate_outlined),
            label: const Text('Add document'),
          ),
        ],
      ),
    );
  }
}
