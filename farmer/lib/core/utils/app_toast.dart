import 'package:flutter/material.dart';

abstract final class AppToast {
  static final messengerKey = GlobalKey<ScaffoldMessengerState>();

  static void show(String message) {
    messengerKey.currentState
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }
}
