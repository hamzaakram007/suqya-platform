import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final apiClientProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_URL', defaultValue: 'http://localhost:4000/v1'),
    headers: {'X-Tenant-Id': 'default-tenant'},
  ));
  return dio;
});

final authTokenProvider = StateProvider<String?>((ref) => null);
