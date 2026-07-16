import 'package:flutter/material.dart';

import 'buyer_deals_panel.dart';
import 'sell_goods_panel.dart';

class FarmerWorkspace extends StatelessWidget {
  const FarmerWorkspace({super.key});

  @override
  Widget build(BuildContext context) {
    return const DefaultTabController(
      length: 2,
      child: Column(
        children: [
          Material(
            child: TabBar(
              tabs: [
                Tab(icon: Icon(Icons.add_business_rounded), text: 'Sell goods'),
                Tab(
                  icon: Icon(Icons.handshake_rounded),
                  text: 'Offers & deals',
                ),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(children: [SellGoodsPanel(), BuyerDealsPanel()]),
          ),
        ],
      ),
    );
  }
}
