import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_core/flutter_core.dart';
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
  runApp(const ProviderScope(child: SuqyaDriverApp()));
}

class SuqyaDriverApp extends ConsumerWidget {
  const SuqyaDriverApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(driverRouterProvider);
    final locale = ref.watch(localeProvider);

    return MaterialApp.router(
      title: 'Suqya Driver',
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
