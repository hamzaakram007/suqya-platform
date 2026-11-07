import { resolveRedisConnection } from './redis.config';

describe('resolveRedisConnection', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('parses REDIS_URL host port and password', () => {
    process.env.REDIS_URL = 'redis://default:s3cret@redis.example:6380';
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;

    expect(resolveRedisConnection()).toEqual({
      host: 'redis.example',
      port: 6380,
      username: 'default',
      password: 's3cret',
    });
  });

  it('enables tls for rediss://', () => {
    process.env.REDIS_URL = 'rediss://:pw@upstash.example:6379';
    expect(resolveRedisConnection()).toMatchObject({
      host: 'upstash.example',
      password: 'pw',
      tls: {},
    });
  });

  it('falls back to REDIS_HOST / REDIS_PORT', () => {
    delete process.env.REDIS_URL;
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 'local';

    expect(resolveRedisConnection()).toEqual({
      host: 'localhost',
      port: 6380,
      password: 'local',
    });
  });
});
