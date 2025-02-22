import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(identifier: string, maxRequests: number, windowSeconds: number) {
  const key = `rate-limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const requests = await redis.zcount(key, windowStart, now);
  if (requests >= maxRequests) {
    return { allowed: false, retryAfter: windowSeconds - Math.floor((now - windowStart) / 1000) };
  }

  await redis.zadd(key, { score: now, member: `${now}` });
  await redis.zremrangebyscore(key, 0, windowStart); // Clean up old entries
  await redis.expire(key, windowSeconds); // Set expiration
  return { allowed: true };
}