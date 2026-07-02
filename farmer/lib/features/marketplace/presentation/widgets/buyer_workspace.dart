import 'package:flutter/material.dart';

import 'buyer_deals_panel.dart';
import 'buyer_listing_browser.dart';

class BuyerWorkspace extends StatelessWidget {
  const BuyerWorkspace({super.key});

  @override
  Widget build(BuildContext context) {
    return const DefaultTabController(
      length: 2,
      child: Column(
        children: [
          Material(
            child: TabBar(
              tabs: [
                Tab(icon: Icon(Icons.storefront_rounded), text: 'Marketplace'),
                Tab(icon: Icon(Icons.handshake_rounded), text: 'Offers & deals'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              children: [
                SingleChildScrollView(
                  padding: EdgeInsets.all(20),
                  child: BuyerListingBrowser(),
                ),
                BuyerDealsPanel(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
