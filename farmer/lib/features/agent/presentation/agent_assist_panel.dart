import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../data/agent_api.dart';

class AgentAssistPanel extends StatefulWidget {
  const AgentAssistPanel({super.key});

  @override
  State<AgentAssistPanel> createState() => _AgentAssistPanelState();
}

class _AgentAssistPanelState extends State<AgentAssistPanel> {
  bool _farmerMode = true;
  bool _busy = false;
  String? _actionId;
  String? _demoOtp;
  final _phone = TextEditingController();
  final _name = TextEditingController();
  final _password = TextEditingController();
  final _land = TextEditingController();
  final _good = TextEditingController(text: 'Potato');
  final _quantity = TextEditingController();
  final _price = TextEditingController();
  final _otp = TextEditingController();
  late Future<List<Map<String, dynamic>>> _history;

  @override
  void initState() {
    super.initState();
    _history = AgentApi().history();
  }

  Future<void> _request() async {
    setState(() => _busy = true);
    try {
      final result = _farmerMode
          ? await AgentApi().requestFarmer({
              'name': _name.text.trim(),
              'phoneNumber': _phone.text.trim(),
              'password': _password.text,
              'landAmount': double.parse(_land.text),
            })
          : await AgentApi().requestListing({
              'farmerPhone': _phone.text.trim(),
              'goodCode': _good.text.trim().toLowerCase(),
              'goodName': _good.text.trim(),
              'quantity': double.parse(_quantity.text),
              'unit': 'kg',
              'governmentPrice': double.parse(_price.text),
              'marketPrice': double.parse(_price.text),
              'minimumPrice': double.parse(_price.text),
            });
      setState(() {
        _actionId = result['actionId']?.toString();
        _demoOtp = result['demoOtp']?.toString();
      });
    } catch (error) {
      _show(error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _verify() async {
    if (_actionId == null) return;
    setState(() => _busy = true);
    try {
      await AgentApi().verify(actionId: _actionId!, otp: _otp.text.trim());
      _show('Farmer authorization completed successfully.');
      setState(() {
        _actionId = null;
        _demoOtp = null;
        _otp.clear();
        _history = AgentApi().history();
      });
    } catch (error) {
      _show(error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _show(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
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
              Icon(Icons.support_agent_rounded, color: Colors.white, size: 46),
              SizedBox(width: 14),
              Expanded(
                child: Text(
                  'Assist farmers only after OTP authorization from their phone.',
                  style: TextStyle(color: Colors.white, fontSize: 17),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SegmentedButton<bool>(
          segments: const [
            ButtonSegment(value: true, label: Text('Create farmer'), icon: Icon(Icons.person_add_alt_1_rounded)),
            ButtonSegment(value: false, label: Text('Post for farmer'), icon: Icon(Icons.add_business_rounded)),
          ],
          selected: {_farmerMode},
          onSelectionChanged: (value) => setState(() {
            _farmerMode = value.first;
            _actionId = null;
          }),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _field(_phone, 'Farmer phone', Icons.phone_rounded),
                if (_farmerMode) ...[
                  const SizedBox(height: 10),
                  _field(_name, 'Farmer name', Icons.person_rounded),
                  const SizedBox(height: 10),
                  _field(_password, 'Temporary password', Icons.lock_outline_rounded),
                  const SizedBox(height: 10),
                  _field(_land, 'Land amount', Icons.landscape_rounded, number: true),
                ] else ...[
                  const SizedBox(height: 10),
                  _field(_good, 'Goods name', Icons.eco_rounded),
                  const SizedBox(height: 10),
                  _field(_quantity, 'Quantity in kg', Icons.scale_rounded, number: true),
                  const SizedBox(height: 10),
                  _field(_price, 'Minimum price', Icons.payments_outlined, number: true),
                ],
                const SizedBox(height: 14),
                FilledButton.icon(
                  onPressed: _busy ? null : _request,
                  icon: const Icon(Icons.sms_outlined),
                  label: Text(_busy ? 'Working...' : 'Request farmer OTP'),
                ),
                if (_actionId != null) ...[
                  const Divider(height: 28),
                  TextField(
                    controller: _otp,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Farmer OTP',
                      helperText: _demoOtp == null ? null : 'Demo OTP: $_demoOtp',
                      prefixIcon: const Icon(Icons.password_rounded),
                    ),
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: _busy ? null : _verify,
                    icon: const Icon(Icons.verified_rounded),
                    label: const Text('Verify and complete'),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text('Activity history', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
        FutureBuilder<List<Map<String, dynamic>>>(
          future: _history,
          builder: (context, snapshot) {
            final items = snapshot.data ?? const <Map<String, dynamic>>[];
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LinearProgressIndicator();
            }
            if (items.isEmpty) {
              return const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('No assisted actions yet.')));
            }
            return Column(
              children: items.map((item) => Card(
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFEAF4E6),
                    foregroundColor: AppColors.primary,
                    child: Icon(Icons.history_rounded),
                  ),
                  title: Text(item['type']?.toString() ?? 'Agent action'),
                  subtitle: Text('${item['farmerPhone']} • ${item['status']}'),
                ),
              )).toList(growable: false),
            );
          },
        ),
      ],
    );
  }

  TextField _field(
    TextEditingController controller,
    String label,
    IconData icon, {
    bool number = false,
  }) {
    return TextField(
      controller: controller,
      keyboardType: number ? TextInputType.number : TextInputType.text,
      decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
    );
  }
}
