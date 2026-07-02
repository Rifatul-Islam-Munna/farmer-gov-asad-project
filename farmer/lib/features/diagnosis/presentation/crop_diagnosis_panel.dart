import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../core/theme/app_theme.dart';
import '../data/detection_api.dart';

class CropDiagnosisPanel extends StatefulWidget {
  const CropDiagnosisPanel({super.key});

  @override
  State<CropDiagnosisPanel> createState() => _CropDiagnosisPanelState();
}

class _CropDiagnosisPanelState extends State<CropDiagnosisPanel> {
  XFile? _image;
  Map<String, dynamic>? _result;
  bool _busy = false;

  Future<void> _pick(ImageSource source) async {
    if (source == ImageSource.camera) {
      final status = await Permission.camera.request();
      if (!status.isGranted) return;
    }
    final image = await ImagePicker().pickImage(
      source: source,
      imageQuality: 82,
      maxWidth: 1600,
    );
    if (image == null) return;
    setState(() {
      _image = image;
      _result = null;
    });
  }

  Future<void> _analyze() async {
    final image = _image;
    if (image == null) return;
    setState(() => _busy = true);
    try {
      final result = await DetectionApi().diagnose(image);
      setState(() => _result = result);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final diagnosis = _result?['diagnosis'] as Map?;
    final treatment = _result?['treatment'] as Map?;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Color(0xFFEAF4E6),
                    foregroundColor: AppColors.primary,
                    child: Icon(Icons.camera_alt_rounded),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Crop and insect check',
                      style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Container(
                height: 220,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF4E6),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.border),
                ),
                clipBehavior: Clip.antiAlias,
                child: _image == null
                    ? const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.image_search_rounded, size: 64, color: AppColors.primary),
                          SizedBox(height: 8),
                          Text('Take or select a crop image'),
                        ],
                      )
                    : Image.file(File(_image!.path), fit: BoxFit.cover),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _pick(ImageSource.gallery),
                      icon: const Icon(Icons.photo_library_outlined),
                      label: const Text('Gallery'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => _pick(ImageSource.camera),
                      icon: const Icon(Icons.camera_alt_rounded),
                      label: const Text('Camera'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              FilledButton.icon(
                onPressed: _image == null || _busy ? null : _analyze,
                icon: _busy
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.auto_awesome_rounded),
                label: Text(_busy ? 'Analyzing...' : 'Analyze image'),
              ),
              if (diagnosis != null) ...[
                const SizedBox(height: 20),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.bug_report_rounded, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                diagnosis['name']?.toString() ?? 'Detected issue',
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                              ),
                            ),
                            Text('${((diagnosis['confidence'] as num? ?? 0) * 100).toStringAsFixed(0)}%'),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Risk: ${diagnosis['risk']}'),
                        const SizedBox(height: 10),
                        _items('Symptoms', diagnosis['symptoms']),
                      ],
                    ),
                  ),
                ),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Treatment and safety', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 8),
                        _items('Steps', treatment?['steps']),
                        const SizedBox(height: 8),
                        _items('Safety', treatment?['safety']),
                        const SizedBox(height: 8),
                        Text('Suggested products: ${(treatment?['medicineCodes'] as List? ?? const []).join(', ')}'),
                      ],
                    ),
                  ),
                ),
                const Text(
                  'Demo result: the provider can be replaced later without changing this screen.',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _items(String title, Object? raw) {
    final items = raw as List? ?? const [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        ...items.map((item) => Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text('• $item'),
            )),
      ],
    );
  }
}
