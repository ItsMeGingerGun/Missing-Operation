import { kv } from '@vercel/kv';

export const rateLimit = async (identifier: string, limit = 10) => {
  const key = `rate_limit:${identifier}`;
  const current = await kv.get<number>(key) || 0;
  
  if (current >= limit) {
    return false;
  }
  
  await kv.incr(key);
  await kv.expire(key, 60); // 1 minute window
  return true;
};
