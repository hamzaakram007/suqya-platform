import { generateRefreshToken, hashRefreshToken } from './token-hash';

describe('token-hash', () => {
  it('hashes deterministically for indexed lookup', () => {
    const token = 'test-refresh-token';
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
    expect(hashRefreshToken(token)).toHaveLength(64);
  });

  it('produces different hashes for different tokens', () => {
    expect(hashRefreshToken('a')).not.toBe(hashRefreshToken('b'));
  });

  it('generates high-entropy opaque tokens', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(40);
  });
});
