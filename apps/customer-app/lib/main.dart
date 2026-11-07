import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_core/flutter_core.dart';
import 'core/providers/locale_api_client.dart';
import 'core/providers/locale_provider.dart';
import 'core/router/app_router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(
    ProviderScope(
      overrides: [
        apiClientProvider.overrideWith((ref) => ref.watch(localeAwareApiClientProvider)),
      ],
      child: const SuqyaCustomerApp(),
    ),
  );
}

class SuqyaCustomerApp extends ConsumerWidget {
  const SuqyaCustomerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final locale = ref.watch(localeProvider);

    return MaterialApp.router(
      onGenerateTitle: (context) => AppLocalizations.of(context)!.appTitle,
      debugShowCheckedModeBanner: false,
      theme: buildSuqyaTheme(),
      darkTheme: buildSuqyaTheme(brightness: Brightness.dark),
      themeMode: ref.watch(themeModeProvider),
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
      builder: (context, child) {
        final dir = locale.languageCode == 'ar'
            ? TextDirection.rtl
            : TextDirection.ltr;
        return Directionality(
          textDirection: dir,
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
