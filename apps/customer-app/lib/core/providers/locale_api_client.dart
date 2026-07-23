import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/flutter_core.dart';
import 'locale_provider.dart';

/// Customer app Dio client with auth + Accept-Language from active locale.
final localeAwareApiClientProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      headers: ApiConfig.defaultHeaders,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        options.headers['Accept-Language'] =
            ref.read(localeProvider).languageCode;

        final session = ref.read(authSessionProvider);
        final token = session.maybeWhen(
          data: (s) => s.accessToken,
          orElse: () => null,
        );
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await ref.read(authSessionProvider.notifier).signOut();
        }
        handler.next(error);
      },
    ),
  );

  return dio;
});
