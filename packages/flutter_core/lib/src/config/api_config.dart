class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:4000/v1',
  );

  static const String tenantId = String.fromEnvironment(
    'TENANT_ID',
    defaultValue: 'default-tenant',
  );

  static const Map<String, String> defaultHeaders = {
    'X-Tenant-Id': tenantId,
    'Content-Type': 'application/json',
  };

  /// HTTP origin for Socket.io (Nest gateway namespaces are not under `/v1`).
  /// `http://localhost:4000/v1` → `http://localhost:4000`
  static String get socketOrigin {
    final uri = Uri.parse(baseUrl);
    final path = uri.path;
    final trimmed = path.endsWith('/v1')
        ? path.substring(0, path.length - 3)
        : path.replaceAll(RegExp(r'/v1/?$'), '');
    return uri.replace(path: trimmed.isEmpty ? '' : trimmed, query: '').toString().replaceAll(RegExp(r'/$'), '');
  }
}
