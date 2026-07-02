import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

@RoutePage()
class ListingFormPage extends StatelessWidget {
  const ListingFormPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AppBar(title: Text('Create post')),
      body: Center(
        child: Text('Goods posting form will be added in the next feature.'),
      ),
    );
  }
}
