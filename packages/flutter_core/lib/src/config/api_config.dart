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
}
