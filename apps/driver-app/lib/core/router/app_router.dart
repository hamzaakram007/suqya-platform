import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/otp_screen.dart';
import '../../features/home/driver_home_screen.dart';
import '../../features/jobs/jobs_list_screen.dart';
import '../../features/jobs/job_detail_screen.dart';
import '../../features/jobs/pod_screen.dart';
import '../../features/earnings/earnings_screen.dart';
import '../../features/profile/driver_profile_screen.dart';
import '../../features/settings/driver_settings_screen.dart';

final driverRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authSessionProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      return authState.when(
        loading: () => null,
        error: (_, __) =>
            state.matchedLocation == '/login' ? null : '/login',
        data: (session) {
          final isAuth = session.isAuthenticated;
          final loc = state.matchedLocation;
          final isAuthRoute = loc == '/login' || loc == '/otp';
          if (!isAuth && !isAuthRoute) return '/login';
          if (isAuth && (loc == '/login' || loc == '/otp')) return '/home';
          return null;
        },
      );
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const DriverLoginScreen()),
      GoRoute(path: '/otp', builder: (_, __) => const DriverOtpScreen()),
      GoRoute(path: '/home', builder: (_, __) => const DriverHomeScreen()),
      GoRoute(path: '/jobs', builder: (_, __) => const JobsListScreen()),
      GoRoute(
        path: '/jobs/:orderId',
        builder: (_, state) =>
            JobDetailScreen(orderId: state.pathParameters['orderId']!),
      ),
      GoRoute(
        path: '/jobs/:orderId/pod',
        builder: (_, state) =>
            PodScreen(orderId: state.pathParameters['orderId']!),
      ),
      GoRoute(path: '/earnings', builder: (_, __) => const EarningsScreen()),
      GoRoute(
        path: '/profile',
        builder: (_, __) => const DriverProfileScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (_, __) => const DriverSettingsScreen(),
      ),
    ],
  );
});
