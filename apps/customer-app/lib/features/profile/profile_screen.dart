import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الملف الشخصي')),
      body: ListView(
        children: [
          const ListTile(leading: Icon(Icons.history), title: Text('سجل الطلبات')),
          const ListTile(leading: Icon(Icons.receipt), title: Text('الفواتير')),
          const ListTile(leading: Icon(Icons.account_balance_wallet), title: Text('المحفظة')),
          const ListTile(leading: Icon(Icons.credit_card), title: Text('كشف حساب الآجل')),
          const ListTile(leading: Icon(Icons.location_on), title: Text('العناوين')),
          const ListTile(leading: Icon(Icons.settings), title: Text('الإعدادات')),
          const ListTile(leading: Icon(Icons.support_agent), title: Text('الدعم')),
        ],
      ),
    );
  }
}
