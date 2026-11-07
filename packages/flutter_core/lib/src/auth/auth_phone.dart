import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Holds the phone number entered during login for OTP verification.
final authPhoneProvider = StateProvider<String?>((ref) => null);
