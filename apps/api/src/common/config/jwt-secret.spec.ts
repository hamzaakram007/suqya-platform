import {
  assertJwtSecret,
  resolveJwtSecrets,
  isProdLikeEnv,
  DEV_FALLBACK_JWT_SECRET,
  MIN_JWT_SECRET_LENGTH,
} from './jwt-secret';

describe('jwt-secret', () => {
  const strong = 'a'.repeat(MIN_JWT_SECRET_LENGTH) + '-staging-secret';

  it('detects prod-like environments', () => {
    expect(isProdLikeEnv({ NODE_ENV: 'production' })).toBe(true);
    expect(isProdLikeEnv({ APP_ENV: 'staging' })).toBe(true);
    expect(isProdLikeEnv({ REQUIRE_STRONG_JWT: 'true' })).toBe(true);
    expect(isProdLikeEnv({ NODE_ENV: 'development' })).toBe(false);
  });

  it('allows missing secret in development', () => {
    expect(assertJwtSecret({ NODE_ENV: 'development' })).toBe(
      DEV_FALLBACK_JWT_SECRET,
    );
  });

  it('fails fast when JWT_SECRET missing in production', () => {
    expect(() => assertJwtSecret({ NODE_ENV: 'production' })).toThrow(
      /JWT_SECRET is required/,
    );
  });

  it('rejects short secrets in staging', () => {
    expect(() =>
      assertJwtSecret({ APP_ENV: 'staging', JWT_SECRET: 'too-short' }),
    ).toThrow(/at least/);
  });

  it('rejects known weak defaults in production', () => {
    expect(() =>
      assertJwtSecret({
        NODE_ENV: 'production',
        JWT_SECRET: DEV_FALLBACK_JWT_SECRET,
      }),
    ).toThrow(/weak/);
  });

  it('accepts a strong secret', () => {
    expect(assertJwtSecret({ NODE_ENV: 'production', JWT_SECRET: strong })).toBe(
      strong,
    );
  });

  it('resolves previous secret for rotation', () => {
    const previous = 'b'.repeat(MIN_JWT_SECRET_LENGTH) + '-old';
    expect(
      resolveJwtSecrets({
        NODE_ENV: 'production',
        JWT_SECRET: strong,
        JWT_SECRET_PREVIOUS: previous,
      }),
    ).toEqual({ primary: strong, previous });
  });

  it('rejects identical previous secret', () => {
    expect(() =>
      resolveJwtSecrets({
        NODE_ENV: 'production',
        JWT_SECRET: strong,
        JWT_SECRET_PREVIOUS: strong,
      }),
    ).toThrow(/differ/);
  });
});
