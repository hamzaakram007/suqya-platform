import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF0A6E6E);

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: primary, primary: primary),
        appBarTheme: const AppBarTheme(backgroundColor: primary, foregroundColor: Colors.white),
      );
}
