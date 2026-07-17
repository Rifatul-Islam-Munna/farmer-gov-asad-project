import 'package:flutter/material.dart';

abstract final class AppToast {
  static final messengerKey = GlobalKey<ScaffoldMessengerState>();

  static void success(String message) => _show(
        message,
        icon: Icons.check_circle_rounded,
        backgroundColor: const Color(0xFF15803D),
      );

  static void error(String message) => _show(
        message,
        icon: Icons.error_rounded,
        backgroundColor: const Color(0xFFB91C1C),
        duration: const Duration(seconds: 4),
      );

  static void warning(String message) => _show(
        message,
        icon: Icons.warning_amber_rounded,
        backgroundColor: const Color(0xFFB45309),
      );

  static void info(String message) => _show(
        message,
        icon: Icons.info_rounded,
        backgroundColor: const Color(0xFF0369A1),
      );

  static void show(String message) => info(message);

  static void hide() => messengerKey.currentState?.hideCurrentSnackBar();

  static void _show(
    String message, {
    required IconData icon,
    required Color backgroundColor,
    Duration duration = const Duration(seconds: 3),
  }) {
    final messenger = messengerKey.currentState;
    if (messenger == null || message.trim().isEmpty) return;

    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  message.trim(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    height: 1.3,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: backgroundColor.withValues(alpha: 0.96),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.white.withValues(alpha: 0.18)),
          ),
          elevation: 12,
          duration: duration,
          dismissDirection: DismissDirection.horizontal,
        ),
      );
  }
}
