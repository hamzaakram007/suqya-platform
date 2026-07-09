import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';

/// 3-tap order flow: Select tank → Confirm price → Place order
class OrderFlowScreen extends ConsumerStatefulWidget {
  const OrderFlowScreen({super.key});

  @override
  ConsumerState<OrderFlowScreen> createState() => _OrderFlowScreenState();
}

class _OrderFlowScreenState extends ConsumerState<OrderFlowScreen> {
  int _step = 0;
  String? _selectedTankId;
  String _paymentType = 'cash';
  List<dynamic> _tankSizes = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadTankSizes();
  }

  Future<void> _loadTankSizes() async {
    final dio = ref.read(apiClientProvider);
    final response = await dio.get('/catalog/tank-sizes');
    setState(() => _tankSizes = response.data as List);
  }

  Future<void> _placeOrder() async {
    setState(() => _loading = true);
    try {
      final dio = ref.read(apiClientProvider);
      final token = ref.read(authTokenProvider);
      final response = await dio.post(
        '/orders',
        data: {
          'addressId': 'default-address',
          'tankSizeId': _selectedTankId,
          'paymentType': _paymentType,
        },
        options: token != null
            ? Options(headers: {'Authorization': 'Bearer $token'})
            : null,
      );
      if (mounted) context.go('/tracking/${response.data['id']}');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_step == 0 ? 'اختر الحجم' : _step == 1 ? 'تأكيد الطلب' : 'الدفع')),
      body: _step == 0 ? _buildTankSelect() : _step == 1 ? _buildConfirm() : _buildPayment(),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: ElevatedButton(
          onPressed: _loading
              ? null
              : () {
                  if (_step < 2) {
                    setState(() => _step++);
                  } else {
                    _placeOrder();
                  }
                },
          child: Text(_step < 2 ? 'التالي' : 'تأكيد الطلب'),
        ),
      ),
    );
  }

  Widget _buildTankSelect() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _tankSizes.length,
      itemBuilder: (_, i) {
        final tank = _tankSizes[i];
        final selected = _selectedTankId == tank['id'];
        return Card(
          color: selected ? Theme.of(context).colorScheme.primaryContainer : null,
          child: ListTile(
            leading: const Icon(Icons.local_shipping),
            title: Text(tank['nameAr'] ?? ''),
            subtitle: Text('${tank['capacityLiters']} لتر'),
            trailing: selected ? const Icon(Icons.check_circle) : null,
            onTap: () => setState(() => _selectedTankId = tank['id']),
          ),
        );
      },
    );
  }

  Widget _buildConfirm() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('ملخص الطلب', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          const ListTile(title: Text('العنوان'), subtitle: Text('الرياض - حي النرجس')),
          ListTile(
            title: const Text('الحجم'),
            subtitle: Text(_tankSizes.firstWhere((t) => t['id'] == _selectedTankId, orElse: () => {})['nameAr'] ?? ''),
          ),
          const Divider(),
          const ListTile(
            title: Text('المجموع (شامل الضريبة)'),
            trailing: Text('172.50 ر.س', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildPayment() {
    return Column(
      children: [
        RadioListTile(
          title: const Text('نقداً عند التسليم'),
          value: 'cash',
          groupValue: _paymentType,
          onChanged: (v) => setState(() => _paymentType = v!),
        ),
        RadioListTile(
          title: const Text('بطاقة / مدى / Apple Pay'),
          value: 'card',
          groupValue: _paymentType,
          onChanged: (v) => setState(() => _paymentType = v!),
        ),
        RadioListTile(
          title: const Text('حساب آجل'),
          value: 'credit',
          groupValue: _paymentType,
          onChanged: (v) => setState(() => _paymentType = v!),
        ),
      ],
    );
  }
}