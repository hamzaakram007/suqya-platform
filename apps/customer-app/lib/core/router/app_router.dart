import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/shell/main_shell.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/otp_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/order/tracking_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/orders/orders_list_screen.dart';
import '../../features/orders/order_detail_screen.dart';
import '../../features/addresses/addresses_screen.dart';
import '../../features/wallet/wallet_screen.dart';
import '../../features/support/support_screen.dart';
import '../../features/notifications/notifications_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/coupons/coupons_screen.dart';
import '../../features/credit/credit_screen.dart';
import '../../features/invoices/invoices_screen.dart';
import '../../features/ratings/ratings_screen.dart';
import '../../features/recurring/recurring_orders_screen.dart';
import '../../features/favorites/favorites_screen.dart';
import '../../features/help/help_screen.dart';
import '../../features/about/about_screen.dart';

final _rootKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authSessionProvider);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final loc = state.matchedLocation;
      final isSplash = loc == '/splash';
      final isAuthRoute = loc == '/login' || loc == '/otp';

      return authState.when(
        loading: () => isSplash || isAuthRoute ? null : '/splash',
        error: (_, __) => isAuthRoute ? null : '/login',
        data: (session) {
          final isAuth = session.isAuthenticated;
          if (isSplash) return null;
          if (!isAuth && !isAuthRoute) return '/login';
          if (isAuth && isAuthRoute) return '/home';
          return null;
        },
      );
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/otp', builder: (_, __) => const OtpScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (_, __) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/track',
                builder: (_, __) => const TrackingHubScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/account',
                builder: (_, __) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/tracking/:orderId',
        builder: (_, state) => TrackingScreen(
          orderId: state.pathParameters['orderId']!,
        ),
      ),
      GoRoute(path: '/orders', builder: (_, __) => const OrdersListScreen()),
      GoRoute(
        path: '/orders/:orderId',
        builder: (_, state) => OrderDetailScreen(
          orderId: state.pathParameters['orderId']!,
        ),
      ),
      GoRoute(path: '/addresses', builder: (_, __) => const AddressesScreen()),
      GoRoute(path: '/wallet', builder: (_, __) => const WalletScreen()),
      GoRoute(path: '/support', builder: (_, __) => const SupportScreen()),
      GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      GoRoute(path: '/coupons', builder: (_, __) => const CouponsScreen()),
      GoRoute(path: '/credit', builder: (_, __) => const CreditScreen()),
      GoRoute(path: '/invoices', builder: (_, __) => const InvoicesScreen()),
      GoRoute(path: '/ratings', builder: (_, __) => const RatingsScreen()),
      GoRoute(
        path: '/recurring-orders',
        builder: (_, __) => const RecurringOrdersScreen(),
      ),
      GoRoute(path: '/favorites', builder: (_, __) => const FavoritesScreen()),
      GoRoute(path: '/help', builder: (_, __) => const HelpScreen()),
      GoRoute(path: '/about', builder: (_, __) => const AboutScreen()),
    ],
  );
});
