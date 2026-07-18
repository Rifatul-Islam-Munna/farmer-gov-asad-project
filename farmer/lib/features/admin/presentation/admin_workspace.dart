import 'package:farmer/core/utils/app_toast.dart';
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
  final _api = AdminApi();
  final _title = TextEditingController();
  final _message = TextEditingController();

  late Future<_AdminWorkspaceData> _workspace;
  String _targetRole = 'farmer';
  bool _publishing = false;

  @override
  void initState() {
    super.initState();
    _workspace = _load();
  }

  @override
  void dispose() {
    _title.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<_AdminWorkspaceData> _load() async {
    final results = await Future.wait<dynamic>([
      _api.dashboard(),
      _api.health(),
      _api.pendingUsers(),
      _api.auditLogs(limit: 12),
    ]);
    return _AdminWorkspaceData(
      dashboard: Map<String, dynamic>.from(results[0] as Map),
      health: Map<String, dynamic>.from(results[1] as Map),
      pendingUsers: List<Map<String, dynamic>>.from(results[2] as List),
      auditLogs: List<Map<String, dynamic>>.from(results[3] as List),
    );
  }

  Future<void> _refresh() async {
    setState(() => _workspace = _load());
    await _workspace;
  }

  Future<void> _review(String id, String status) async {
    try {
      await _api.updateVerification(id, status);
      AppToast.success('Account $status successfully.');
      await _refresh();
    } catch (_) {
      AppToast.error('Could not update account verification.');
    }
  }

  Future<void> _publish() async {
    final title = _title.text.trim();
    final message = _message.text.trim();
    if (title.isEmpty || message.isEmpty) {
      AppToast.warning('Enter a title and message first.');
      return;
    }

    setState(() => _publishing = true);
    try {
      await _api.publishGuidance(
        type: 'notice',
        title: title,
        message: message,
        targetRole: _targetRole,
      );
      _title.clear();
      _message.clear();
      AppToast.success('Notice published successfully.');
    } catch (_) {
      AppToast.error('Could not publish the notice.');
    } finally {
      if (mounted) setState(() => _publishing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: FutureBuilder<_AdminWorkspaceData>(
        future: _workspace,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                GlassCard(
                  child: Padding(
                    padding: const EdgeInsets.all(22),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.cloud_off_rounded,
                          size: 42,
                          color: Colors.orange,
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Admin workspace could not be loaded.',
                          style: TextStyle(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 12),
                        FilledButton.icon(
                          onPressed: _refresh,
                          icon: const Icon(Icons.refresh_rounded),
                          label: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }

          final data = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 32),
            children: [
              _Header(onRefresh: _refresh),
              const SizedBox(height: 18),
              _MetricsGrid(metrics: data.metrics),
              const SizedBox(height: 18),
              _HealthSection(health: data.health),
              const SizedBox(height: 20),
              _SectionTitle(
                title: 'Pending account reviews',
                subtitle: '${data.pendingUsers.length} account(s) waiting',
              ),
              const SizedBox(height: 10),
              _PendingUsers(items: data.pendingUsers, onReview: _review),
              const SizedBox(height: 20),
              const _SectionTitle(
                title: 'Recent audit activity',
                subtitle: 'Security and administrative changes',
              ),
              const SizedBox(height: 10),
              _AuditList(items: data.auditLogs),
              const SizedBox(height: 20),
              const _SectionTitle(
                title: 'Publish notice',
                subtitle: 'Send role-targeted guidance',
              ),
              const SizedBox(height: 10),
              _NoticeForm(
                titleController: _title,
                messageController: _message,
                targetRole: _targetRole,
                publishing: _publishing,
                onRoleChanged: (value) =>
                    setState(() => _targetRole = value),
                onPublish: _publish,
              ),
            ],
          );
        },
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.onRefresh});

  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primaryDark, AppColors.primary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(26),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: .22),
            blurRadius: 28,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: .14),
              borderRadius: BorderRadius.circular(19),
            ),
            child: const Icon(
              Icons.admin_panel_settings_rounded,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Admin control center',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 21,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  'Approvals, service health, audit activity and notices.',
                  style: TextStyle(
                    color: Color(0xFFD8EEE7),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          IconButton.filledTonal(
            onPressed: onRefresh,
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
    );
  }
}

class _MetricsGrid extends StatelessWidget {
  const _MetricsGrid({required this.metrics});

  final Map<String, dynamic> metrics;

  @override
  Widget build(BuildContext context) {
    final items = [
      _Metric('Users', metrics['totalUsers'] ?? 0, Icons.people_alt_rounded),
      _Metric('Pending', metrics['pendingUsers'] ?? 0, Icons.hourglass_top_rounded),
      _Metric('Listings', metrics['totalListings'] ?? 0, Icons.storefront_rounded),
      _Metric('Deals', metrics['totalDeals'] ?? 0, Icons.handshake_rounded),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 760 ? 4 : 2;
        return GridView.count(
          crossAxisCount: columns,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: columns == 4 ? 1.4 : 1.35,
          children: items
              .map(
                (item) => GlassCard(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Icon(item.icon, color: AppColors.primary),
                        Text(
                          '${item.value}',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          item.label,
                          style: const TextStyle(
                            color: Colors.grey,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class _HealthSection extends StatelessWidget {
  const _HealthSection({required this.health});

  final Map<String, dynamic> health;

  @override
  Widget build(BuildContext context) {
    final dependencies = Map<String, dynamic>.from(
      health['dependencies'] as Map? ?? const {},
    );
    final items = ['postgresql', 'redis', 'qdrant', 'storage'];

    return GlassCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.monitor_heart_rounded, color: AppColors.primary),
                const SizedBox(width: 9),
                const Expanded(
                  child: Text(
                    'System health',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                  ),
                ),
                _StatusPill(value: health['status']?.toString() ?? 'unknown'),
              ],
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: items.map((key) {
                final raw = Map<String, dynamic>.from(
                  dependencies[key] as Map? ?? const {},
                );
                final available = raw['available'] == true;
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
                  decoration: BoxDecoration(
                    color: (available ? Colors.green : Colors.orange)
                        .withValues(alpha: .10),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: (available ? Colors.green : Colors.orange)
                          .withValues(alpha: .24),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        available ? Icons.check_circle_rounded : Icons.warning_rounded,
                        size: 17,
                        color: available ? Colors.green : Colors.orange,
                      ),
                      const SizedBox(width: 7),
                      Text(
                        key,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _PendingUsers extends StatelessWidget {
  const _PendingUsers({required this.items, required this.onReview});

  final List<Map<String, dynamic>> items;
  final Future<void> Function(String id, String status) onReview;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const GlassCard(
        child: Padding(
          padding: EdgeInsets.all(18),
          child: Text('No pending users.'),
        ),
      );
    }

    return Column(
      children: items.map((item) {
        final id = (item['id'] ?? item['_id']).toString();
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: GlassCard(
            child: Padding(
              padding: const EdgeInsets.all(14),
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
                      '${item['role'] ?? 'unknown'} • ${item['phoneNumber'] ?? 'No phone'}',
                    ),
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => onReview(id, 'rejected'),
                          child: const Text('Reject'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: FilledButton(
                          onPressed: () => onReview(id, 'approved'),
                          child: const Text('Approve'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _AuditList extends StatelessWidget {
  const _AuditList({required this.items});

  final List<Map<String, dynamic>> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const GlassCard(
        child: Padding(
          padding: EdgeInsets.all(18),
          child: Text('No audit events yet.'),
        ),
      );
    }

    return GlassCard(
      child: Column(
        children: items.map((item) {
          final action = item['action']?.toString() ?? 'unknown.action';
          final actor = item['actorUserId']?.toString() ?? 'system';
          return ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFEAF4E6),
              foregroundColor: AppColors.primary,
              child: Icon(Icons.history_rounded),
            ),
            title: Text(action, style: const TextStyle(fontWeight: FontWeight.w700)),
            subtitle: Text('Actor: $actor'),
            trailing: Text(
              _shortDate(item['createdAt']?.toString()),
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          );
        }).toList(),
      ),
    );
  }

  static String _shortDate(String? raw) {
    final value = DateTime.tryParse(raw ?? '')?.toLocal();
    if (value == null) return '';
    return '${value.day}/${value.month} ${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';
  }
}

class _NoticeForm extends StatelessWidget {
  const _NoticeForm({
    required this.titleController,
    required this.messageController,
    required this.targetRole,
    required this.publishing,
    required this.onRoleChanged,
    required this.onPublish,
  });

  final TextEditingController titleController;
  final TextEditingController messageController;
  final String targetRole;
  final bool publishing;
  final ValueChanged<String> onRoleChanged;
  final VoidCallback onPublish;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                labelText: 'Title',
                prefixIcon: Icon(Icons.title_rounded),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: messageController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Message',
                prefixIcon: Icon(Icons.campaign_outlined),
              ),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              initialValue: targetRole,
              decoration: const InputDecoration(labelText: 'Target role'),
              items: const [
                'all',
                'farmer',
                'buyer',
                'agent',
                'seller',
                'machinerySeller',
                'medicineSeller',
                'agricultureSpecialist',
                'veterinaryDoctor',
                'governmentOfficer',
              ]
                  .map(
                    (role) => DropdownMenuItem(value: role, child: Text(role)),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) onRoleChanged(value);
              },
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: publishing ? null : onPublish,
                icon: publishing
                    ? const SizedBox.square(
                        dimension: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.send_rounded),
                label: Text(publishing ? 'Publishing…' : 'Publish notice'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 3),
        Text(subtitle, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.value});

  final String value;

  @override
  Widget build(BuildContext context) {
    final healthy = value == 'ready' || value == 'ok';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: (healthy ? Colors.green : Colors.orange).withValues(alpha: .12),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(
        value,
        style: TextStyle(
          color: healthy ? Colors.green.shade700 : Colors.orange.shade800,
          fontWeight: FontWeight.w800,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _Metric {
  const _Metric(this.label, this.value, this.icon);

  final String label;
  final Object value;
  final IconData icon;
}

class _AdminWorkspaceData {
  const _AdminWorkspaceData({
    required this.dashboard,
    required this.health,
    required this.pendingUsers,
    required this.auditLogs,
  });

  final Map<String, dynamic> dashboard;
  final Map<String, dynamic> health;
  final List<Map<String, dynamic>> pendingUsers;
  final List<Map<String, dynamic>> auditLogs;

  Map<String, dynamic> get metrics => Map<String, dynamic>.from(
        dashboard['metrics'] as Map? ?? const {},
      );
}
