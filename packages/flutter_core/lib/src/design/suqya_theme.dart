import 'package:flutter/material.dart';

/// Suqya Design System V2 — ThemeExtension for premium Flutter apps.
@immutable
class SuqyaTheme extends ThemeExtension<SuqyaTheme> {
  const SuqyaTheme({
    required this.primary,
    required this.primaryDark,
    required this.primaryMuted,
    required this.accent,
    required this.background,
    required this.surface,
    required this.text,
    required this.textSecondary,
    required this.border,
    required this.success,
    required this.warning,
    required this.error,
    required this.radiusMd,
    required this.radiusLg,
    required this.radiusXl,
  });

  final Color primary;
  final Color primaryDark;
  final Color primaryMuted;
  final Color accent;
  final Color background;
  final Color surface;
  final Color text;
  final Color textSecondary;
  final Color border;
  final Color success;
  final Color warning;
  final Color error;
  final double radiusMd;
  final double radiusLg;
  final double radiusXl;

  static const light = SuqyaTheme(
    primary: Color(0xFF0A6E6E),
    primaryDark: Color(0xFF085858),
    primaryMuted: Color(0xFFE6F3F3),
    accent: Color(0xFFC9A227),
    background: Color(0xFFF4F7F7),
    surface: Color(0xFFFFFFFF),
    text: Color(0xFF0F1F1F),
    textSecondary: Color(0xFF5A7070),
    border: Color(0xFFD8E3E3),
    success: Color(0xFF1B7A4E),
    warning: Color(0xFFC47A00),
    error: Color(0xFFC62828),
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 24,
  );

  static const dark = SuqyaTheme(
    primary: Color(0xFF3DADB0),
    primaryDark: Color(0xFF2A8A8C),
    primaryMuted: Color(0xFF143232),
    accent: Color(0xFFD4B44A),
    background: Color(0xFF0B1414),
    surface: Color(0xFF142020),
    text: Color(0xFFF2F7F7),
    textSecondary: Color(0xFF9BB0B0),
    border: Color(0xFF2A3C3C),
    success: Color(0xFF4CAF7A),
    warning: Color(0xFFE6A23C),
    error: Color(0xFFEF5350),
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 24,
  );

  @override
  SuqyaTheme copyWith({
    Color? primary,
    Color? primaryDark,
    Color? primaryMuted,
    Color? accent,
    Color? background,
    Color? surface,
    Color? text,
    Color? textSecondary,
    Color? border,
    Color? success,
    Color? warning,
    Color? error,
    double? radiusMd,
    double? radiusLg,
    double? radiusXl,
  }) {
    return SuqyaTheme(
      primary: primary ?? this.primary,
      primaryDark: primaryDark ?? this.primaryDark,
      primaryMuted: primaryMuted ?? this.primaryMuted,
      accent: accent ?? this.accent,
      background: background ?? this.background,
      surface: surface ?? this.surface,
      text: text ?? this.text,
      textSecondary: textSecondary ?? this.textSecondary,
      border: border ?? this.border,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      error: error ?? this.error,
      radiusMd: radiusMd ?? this.radiusMd,
      radiusLg: radiusLg ?? this.radiusLg,
      radiusXl: radiusXl ?? this.radiusXl,
    );
  }

  @override
  SuqyaTheme lerp(ThemeExtension<SuqyaTheme>? other, double t) {
    if (other is! SuqyaTheme) return this;
    return SuqyaTheme(
      primary: Color.lerp(primary, other.primary, t)!,
      primaryDark: Color.lerp(primaryDark, other.primaryDark, t)!,
      primaryMuted: Color.lerp(primaryMuted, other.primaryMuted, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      text: Color.lerp(text, other.text, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      border: Color.lerp(border, other.border, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      error: Color.lerp(error, other.error, t)!,
      radiusMd: radiusMd + (other.radiusMd - radiusMd) * t,
      radiusLg: radiusLg + (other.radiusLg - radiusLg) * t,
      radiusXl: radiusXl + (other.radiusXl - radiusXl) * t,
    );
  }
}

SuqyaTheme sq(BuildContext context) =>
    Theme.of(context).extension<SuqyaTheme>() ?? SuqyaTheme.light;

ThemeData buildSuqyaTheme({Brightness brightness = Brightness.light}) {
  final ext = brightness == Brightness.dark ? SuqyaTheme.dark : SuqyaTheme.light;
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    fontFamily: 'IBMPlexSansArabic',
    scaffoldBackgroundColor: ext.background,
    colorScheme: ColorScheme(
      brightness: brightness,
      primary: ext.primary,
      onPrimary: Colors.white,
      secondary: ext.accent,
      onSecondary: ext.text,
      error: ext.error,
      onError: Colors.white,
      surface: ext.surface,
      onSurface: ext.text,
    ),
    extensions: [ext],
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      foregroundColor: ext.text,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontFamily: 'IBMPlexSansArabic',
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: ext.text,
      ),
    ),
  );
}
