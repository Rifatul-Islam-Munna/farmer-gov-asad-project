import 'package:flutter/material.dart';

class RoleHomeContent {
  const RoleHomeContent({
    required this.label,
    required this.title,
    required this.description,
    required this.icon,
    required this.actions,
    required this.tip,
  });

  final String label;
  final String title;
  final String description;
  final IconData icon;
  final List<RoleHomeAction> actions;
  final String tip;

  factory RoleHomeContent.forRole(String role) {
    switch (role) {
      case 'buyer':
        return const RoleHomeContent(
          label: 'Buyer',
          title: 'Buy directly from farmers',
          description: 'Search goods, negotiate offers and confirm fair deals.',
          icon: Icons.shopping_basket_rounded,
          actions: [
            RoleHomeAction(
              Icons.storefront_rounded,
              'Browse listings',
              'Search quantity, location and minimum price.',
              1,
            ),
            RoleHomeAction(
              Icons.handshake_rounded,
              'Offers and deals',
              'Counter, accept and review confirmed deals.',
              2,
            ),
            RoleHomeAction(
              Icons.query_stats_rounded,
              'Market rates',
              'Compare listings with government reference rates.',
              1,
            ),
          ],
          tip:
              'A deal becomes final only when buyer and farmer accept the same quantity and price.',
        );
      case 'agent':
        return const RoleHomeContent(
          label: 'Agent',
          title: 'Assist farmers securely',
          description: 'Create accounts and post for farmers with OTP consent.',
          icon: Icons.support_agent_rounded,
          actions: [
            RoleHomeAction(
              Icons.person_add_alt_1_rounded,
              'Create farmer',
              'Complete farmer registration through OTP.',
              2,
            ),
            RoleHomeAction(
              Icons.add_business_rounded,
              'Post for farmer',
              'Prepare and authorize delegated listings.',
              2,
            ),
            RoleHomeAction(
              Icons.history_rounded,
              'Activity history',
              'Review assisted actions and status.',
              2,
            ),
          ],
          tip:
              'Never complete an assisted action without the OTP received by the farmer.',
        );
      case 'medicineSeller':
        return const RoleHomeContent(
          label: 'Medicine seller',
          title: 'Keep nearby farmers supplied',
          description: 'Maintain shop location, available products and stock.',
          icon: Icons.medical_services_rounded,
          actions: [
            RoleHomeAction(
              Icons.location_on_rounded,
              'Shop location',
              'Set shop address and map coordinates.',
              2,
            ),
            RoleHomeAction(
              Icons.inventory_2_rounded,
              'Inventory',
              'Update product stock, unit and price.',
              2,
            ),
            RoleHomeAction(
              Icons.near_me_rounded,
              'Nearby visibility',
              'Review how farmers find your products.',
              1,
            ),
          ],
          tip:
              'Keep stock and location current so recommendations stay accurate.',
        );
      case 'admin':
        return const RoleHomeContent(
          label: 'Administrator',
          title: 'Manage the platform',
          description: 'Review users, reference data and marketplace activity.',
          icon: Icons.admin_panel_settings_rounded,
          actions: [
            RoleHomeAction(
              Icons.verified_user_rounded,
              'User reviews',
              'Approve or reject pending accounts.',
              2,
            ),
            RoleHomeAction(
              Icons.price_change_rounded,
              'Rates and goods',
              'Maintain catalog and market prices.',
              1,
            ),
            RoleHomeAction(
              Icons.campaign_rounded,
              'Guidance',
              'Publish suggestions and notices.',
              2,
            ),
          ],
          tip:
              'Review submitted documents carefully before approving protected access.',
        );
      default:
        return const RoleHomeContent(
          label: 'Farmer',
          title: 'Smart farming starts here',
          description:
              'Check crop problems, sell goods and follow fair prices.',
          icon: Icons.agriculture_rounded,
          actions: [
            RoleHomeAction(
              Icons.camera_alt_rounded,
              'Check crop or insect',
              'Take a picture for a demo diagnosis.',
              null,
            ),
            RoleHomeAction(
              Icons.add_box_rounded,
              'Create goods listing',
              'Enter quantity and minimum selling price.',
              2,
            ),
            RoleHomeAction(
              Icons.trending_up_rounded,
              'Market prices',
              'See government and regional movements.',
              1,
            ),
          ],
          tip: 'Photograph unusual crop symptoms before applying treatment.',
        );
    }
  }
}

class RoleHomeAction {
  const RoleHomeAction(this.icon, this.title, this.description, this.tabIndex);

  final IconData icon;
  final String title;
  final String description;
  final int? tabIndex;
}
