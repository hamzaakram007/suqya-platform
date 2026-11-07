import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/locale_api_client.dart';

final customerApiProvider = Provider<CustomerApi>((ref) {
  return CustomerApi(ref.watch(localeAwareApiClientProvider));
});

class CustomerApi {
  CustomerApi(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> getProfile() async {
    final r = await _dio.get('/customers/me');
    return r.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getOrders() async {
    final r = await _dio.get('/orders');
    final data = r.data;
    if (data is Map && data['items'] != null) return data['items'] as List;
    if (data is List) return data;
    return [];
  }

  Future<Map<String, dynamic>> getOrder(String id) async {
    final r = await _dio.get('/orders/$id');
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createOrder({
    required String addressId,
    required String tankSizeId,
    required String paymentType,
  }) async {
    final r = await _dio.post('/orders', data: {
      'addressId': addressId,
      'tankSizeId': tankSizeId,
      'paymentType': paymentType,
    });
    return r.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getTankSizes() async {
    final r = await _dio.get('/catalog/tank-sizes');
    if (r.data is List) return r.data as List;
    return [];
  }

  Future<Map<String, dynamic>> trackOrder(String id) async {
    final r = await _dio.get('/orders/$id/track');
    return r.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getAddresses() async {
    final profile = await getProfile();
    return (profile['addresses'] as List?) ?? [];
  }

  Future<Map<String, dynamic>> getWallet() async {
    final r = await _dio.get('/wallet');
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> topUpWallet(double amount) async {
    final r = await _dio.post('/wallet/topup', data: {'amount': amount});
    return r.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getSupportTickets() async {
    final r = await _dio.get('/support/tickets');
    return (r.data as List?) ?? [];
  }

  Future<Map<String, dynamic>> createTicket(String subject, String message) async {
    final r = await _dio.post('/support/tickets', data: {
      'subject': subject,
      'message': message,
    });
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>?> getCreditAccount() async {
    final r = await _dio.get('/customers/me/credit');
    return r.data as Map<String, dynamic>?;
  }

  Future<Map<String, dynamic>> getCreditStatement() async {
    final r = await _dio.get('/credit/statement');
    return r.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getInvoices() async {
    final r = await _dio.get('/invoices');
    return (r.data as List?) ?? [];
  }

  Future<Map<String, dynamic>> validateCoupon(String code, double orderAmount) async {
    final r = await _dio.post('/coupons/validate/$code', data: {
      'orderAmount': orderAmount,
    });
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSubscription() async {
    final r = await _dio.get('/subscriptions/me');
    return r.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getSubscriptionPlans() async {
    final r = await _dio.get('/subscriptions/plans');
    return (r.data as List?) ?? [];
  }

  Future<Map<String, dynamic>> getOrderDefaults() async {
    final r = await _dio.get('/customers/me/order-defaults');
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSmartReorder() async {
    final r = await _dio.get('/customers/me/smart-reorder');
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> saveOrderDefaults(Map<String, dynamic> data) async {
    final r = await _dio.post('/customers/me/order-defaults', data: data);
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addAddress(Map<String, dynamic> data) async {
    final r = await _dio.post('/customers/addresses', data: data);
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> rateOrder(String orderId, int score, {String? comment}) async {
    final r = await _dio.post('/orders/$orderId/rate', data: {
      'score': score,
      if (comment != null) 'comment': comment,
    });
    return r.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getFaqs({String? category}) async {
    final r = await _dio.get(
      '/faqs',
      queryParameters: category != null ? {'category': category} : null,
    );
    if (r.data is List) return r.data as List;
    return [];
  }

  Future<Map<String, dynamic>> updateLanguage(String preferredLanguage) async {
    final r = await _dio.patch(
      '/users/me/language',
      data: {'preferredLanguage': preferredLanguage},
    );
    return r.data as Map<String, dynamic>;
  }
}
