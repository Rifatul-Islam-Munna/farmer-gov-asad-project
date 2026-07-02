import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import '../../../../core/storage/session_storage.dart';
import '../../../admin/presentation/admin_workspace.dart';
import '../../../agent/presentation/agent_assist_panel.dart';
import '../../../medicine_seller/presentation/seller_workspace.dart';
import '../widgets/buyer_workspace.dart';
import '../widgets/sell_goods_panel.dart';

@RoutePage()
class ListingFormPage extends StatelessWidget {
  const ListingFormPage({super.key});

  @override
  Widget build(BuildContext context) {
    final role = GetIt.I<SessionStorage>().role;
    final title = switch (role) {
      'buyer' => 'Buyer marketplace',
      'agent' => 'Farmer assistance',
      'medicineSeller' => 'Shop inventory',
      'admin' => 'Administration',
      _ => 'Sell goods',
    };
    final body = switch (role) {
      'buyer' => const BuyerWorkspace(),
      'agent' => const AgentAssistPanel(),
      'medicineSeller' => const SellerWorkspace(),
      'admin' => const AdminWorkspace(),
      _ => const SellGoodsPanel(),
    };

    return Scaffold(appBar: AppBar(title: Text(title)), body: body);
  }
}
