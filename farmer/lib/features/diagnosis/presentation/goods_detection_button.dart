import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../core/theme/app_theme.dart';
import '../data/detection_api.dart';

class GoodsDetectionButton extends StatefulWidget {
  const GoodsDetectionButton({required this.onDetected, super.key});

  final void Function(String code, String name) onDetected;

  @override
  State<GoodsDetectionButton> createState() => _GoodsDetectionButtonState();
}

class _GoodsDetectionButtonState extends State<GoodsDetectionButton> {
  bool _busy = false;

  Future<void> _detect() async {
    final permission = await Permission.camera.request();
    if (!permission.isGranted) return;
    final image = await ImagePicker().pickImage(
      source: ImageSource.camera,
      imageQuality: 82,
      maxWidth: 1600,
    );
    if (image == null) return;

    setState(() => _busy = true);
    try {
      final result = await DetectionApi().identifyGood(image);
      final good = Map<String, dynamic>.from(result['good'] as Map);
      widget.onDetected(good['code'].toString(), good['name'].toString());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Demo identified ${good['name']} (${((good['confidence'] as num) * 100).toStringAsFixed(0)}%). You can edit it.',
            ),
          ),
        );
      }
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
    return OutlinedButton.icon(
      onPressed: _busy ? null : _detect,
      icon: _busy
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.camera_alt_rounded),
      label: Text(_busy ? 'Identifying...' : 'Identify goods from camera'),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        minimumSize: const Size.fromHeight(48),
      ),
    );
  }
}
