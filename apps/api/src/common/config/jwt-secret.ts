/** Well-known weak / placeholder secrets that must never ship to staging/prod. */
export const WEAK_JWT_SECRETS = new Set([
  '',
  'secret',
  'changeme',
  'change-me',
  'jwt-secret',
  'suqya-dev-secret-change-in-production',
  'your-secret-here',
  'password',
  '12345678901234567890123456789012',
]);

export const DEV_FALLBACK_JWT_SECRET =
  'suqya-dev-secret-change-in-production';

export const MIN_JWT_SECRET_LENGTH = 32;

export type JwtSecretEnv = {
  JWT_SECRET?: string;
  JWT_SECRET_PREVIOUS?: string;
  NODE_ENV?: string;
  APP_ENV?: string;
  REQUIRE_STRONG_JWT?: string;
};

export function isProdLikeEnv(env: JwtSecretEnv = process.env): boolean {
  const nodeEnv = (env.NODE_ENV ?? 'development').toLowerCase();
  const appEnv = (env.APP_ENV ?? '').toLowerCase();
  return (
    nodeEnv === 'production' ||
    appEnv === 'staging' ||
    appEnv === 'production' ||
    env.REQUIRE_STRONG_JWT === 'true'
  );
}

/**
 * Fail-fast JWT secret resolution for staging/production.
 * Local development may omit JWT_SECRET and use the documented weak fallback.
 */
export function assertJwtSecret(env: JwtSecretEnv = process.env): string {
  const raw = env.JWT_SECRET?.trim();
  const prodLike = isProdLikeEnv(env);

  if (!raw) {
    if (prodLike) {
      throw new Error(
        'JWT_SECRET is required in staging/production (min 32 chars, not a known default). Generate with: openssl rand -base64 48',
      );
    }
    return DEV_FALLBACK_JWT_SECRET;
  }

  if (prodLike) {
    if (raw.length < MIN_JWT_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters in staging/production`,
      );
    }
    if (WEAK_JWT_SECRETS.has(raw)) {
      throw new Error(
        'JWT_SECRET must not be a known weak/default value in staging/production',
      );
    }
  }

  return raw;
}

export type ResolvedJwtSecrets = {
  primary: string;
  /** Optional previous secret during rotation window (access-token TTL ≈ 15m). */
  previous?: string;
};

/**
 * Primary secret for signing + verify; optional JWT_SECRET_PREVIOUS for rotation.
 * Previous must also be strong when running prod-like.
 */
export function resolveJwtSecrets(
  env: JwtSecretEnv = process.env,
): ResolvedJwtSecrets {
  const primary = assertJwtSecret(env);
  const previous = env.JWT_SECRET_PREVIOUS?.trim() || undefined;

  if (previous) {
    if (previous === primary) {
      throw new Error('JWT_SECRET_PREVIOUS must differ from JWT_SECRET');
    }
    if (isProdLikeEnv(env)) {
      if (previous.length < MIN_JWT_SECRET_LENGTH) {
        throw new Error(
          `JWT_SECRET_PREVIOUS must be at least ${MIN_JWT_SECRET_LENGTH} characters`,
        );
      }
      if (WEAK_JWT_SECRETS.has(previous)) {
        throw new Error('JWT_SECRET_PREVIOUS must not be a known weak/default value');
      }
    }
  }

  return { primary, previous };
}
