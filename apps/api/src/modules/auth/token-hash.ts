import { createHash, randomBytes } from 'crypto';

/** Opaque refresh token (URL-safe). High entropy — SHA-256 lookup is safe. */
export function generateRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Deterministic indexed lookup key for a refresh token. */
export function hashRefreshToken(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex');
}
