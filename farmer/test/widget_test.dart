import 'package:farmer/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Farmer theme renders the application title', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const Scaffold(
          body: Center(child: Text('Farmer Government')),
        ),
      ),
    );

    expect(find.text('Farmer Government'), findsOneWidget);
    expect(Theme.of(tester.element(find.text('Farmer Government'))).useMaterial3, isTrue);
  });
}
