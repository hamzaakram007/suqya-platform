import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import '../providers/locale_provider.dart';

final driverApiProvider = Provider<DriverApi>((ref) {
  final dio = ref.watch(apiClientProvider);
  final interceptor = InterceptorsWrapper(
    onRequest: (options, handler) {
      options.headers['Accept-Language'] =
          ref.read(localeProvider).languageCode;
      handler.next(options);
    },
  );
  dio.interceptors.add(interceptor);
  ref.onDispose(() => dio.interceptors.remove(interceptor));

  return DriverApi(dio);
});

class DriverApi {
  DriverApi(this._dio);

  final Dio _dio;

  Future<void> setOnlineStatus(bool isOnline) async {
    await _dio.patch('/drivers/status', data: {'isOnline': isOnline});
  }

  Future<void> updateLocation(double lat, double lng) async {
    await _dio.post('/drivers/location', data: {
      'latitude': lat,
      'longitude': lng,
    });
  }

  Future<Map<String, dynamic>> getEarnings() async {
    final r = await _dio.get('/drivers/earnings');
    return r.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getOrder(String orderId) async {
    final r = await _dio.get('/orders/$orderId');
    return r.data as Map<String, dynamic>;
  }

  Future<void> acceptJob(String orderId) async {
    await _dio.post('/drivers/jobs/$orderId/accept');
  }

  Future<void> rejectJob(String orderId) async {
    await _dio.post('/drivers/jobs/$orderId/reject');
  }

  Future<void> submitPod(String orderId,
      {String? photoUrl, String? signatureUrl, String? otp}) async {
    await _dio.post('/drivers/jobs/$orderId/pod', data: {
      if (photoUrl != null) 'photoUrl': photoUrl,
      if (signatureUrl != null) 'signatureUrl': signatureUrl,
      if (otp != null) 'otp': otp,
    });
  }

  Future<void> updateLanguage(String languageCode) async {
    await _dio.patch('/users/me/language', data: {
      'preferredLanguage': languageCode,
    });
  }
}
