import 'package:farmer/core/widgets/glass_card.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../data/admin_api.dart';

class AdminWorkspace extends StatefulWidget {
  const AdminWorkspace({super.key});

  @override
  State<AdminWorkspace> createState() => _AdminWorkspaceState();
}

class _AdminWorkspaceState extends State<AdminWorkspace> {
  late Future<List<Map<String, dynamic>>> _pending;
  final _title = TextEditingController();
  final _message = TextEditingController();
  String _targetRole = 'farmer';

  @override
  void initState() {
    super.initState();
    _pending = AdminApi().pendingUsers();
  }

  Future<void> _review(String id, String status) async {
    await AdminApi().updateVerification(id, status);
    setState(() => _pending = AdminApi().pendingUsers());
  }

  Future<void> _publish() async {
    await AdminApi().publishGuidance(
      type: 'notice',
      title: _title.text.trim(),
      message: _message.text.trim(),
      targetRole: _targetRole,
    );
    _title.clear();
    _message.clear();
    if (mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Notice published.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primaryDark, AppColors.primary],
            ),
            borderRadius: BorderRadius.circular(24),
          ),
          child: const Row(
            children: [
              Icon(
                Icons.admin_panel_settings_rounded,
                color: Colors.white,
                size: 46,
              ),
              SizedBox(width: 14),
              Expanded(
                child: Text(
                  'Review accounts and publish role-targeted guidance.',
                  style: TextStyle(color: Colors.white, fontSize: 17),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Pending account reviews',
          style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
        ),
        FutureBuilder<List<Map<String, dynamic>>>(
          future: _pending,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LinearProgressIndicator();
            }
            final items = snapshot.data ?? const <Map<String, dynamic>>[];
            if (items.isEmpty) {
              return const GlassCard(
                child: Padding(
                  padding: EdgeInsets.all(18),
                  child: Text('No pending users.'),
                ),
              );
            }
            return Column(
              children: items
                  .map(
                    (item) => GlassCard(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          children: [
                            ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: const CircleAvatar(
                                backgroundColor: Color(0xFFEAF4E6),
                                foregroundColor: AppColors.primary,
                                child: Icon(Icons.badge_outlined),
                              ),
                              title: Text(item['name']?.toString() ?? 'User'),
                              subtitle: Text(
                                '${item['role']} â€¢ ${item['phoneNumber']}',
                              ),
                            ),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: () => _review(
                                      item['_id'].toString(),
                                      'rejected',
                                    ),
                                    child: const Text('Reject'),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: FilledButton(
                                    onPressed: () => _review(
                                      item['_id'].toString(),
                                      'approved',
                                    ),
                                    child: const Text('Approve'),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                  .toList(growable: false),
            );
          },
        ),
        const SizedBox(height: 20),
        const Text(
          'Publish notice',
          style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
        ),
        GlassCard(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _title,
                  decoration: const InputDecoration(
                    labelText: 'Title',
                    prefixIcon: Icon(Icons.title_rounded),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _message,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Message',
                    prefixIcon: Icon(Icons.campaign_outlined),
                  ),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: _targetRole,
                  decoration: const InputDecoration(labelText: 'Target role'),
                  items:
                      const [
                            'all',
                            'farmer',
                            'buyer',
                            'agent',
                            'medicineSeller',
                          ]
                          .map(
                            (role) => DropdownMenuItem(
                              value: role,
                              child: Text(role),
                            ),
                          )
                          .toList(),
                  onChanged: (value) =>
                      setState(() => _targetRole = value ?? 'farmer'),
                ),
                const SizedBox(height: 14),
                FilledButton.icon(
                  onPressed: _publish,
                  icon: const Icon(Icons.send_rounded),
                  label: const Text('Publish notice'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
