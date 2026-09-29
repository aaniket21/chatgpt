export class RateLimiter {
  private cache: Map<string, { count: number; expiresAt: number }>;
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 20, windowMs: number = 60000) {
    this.cache = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(id: string): { success: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const record = this.cache.get(id);

    // Cleanup stale entries randomly
    if (Math.random() < 0.1) {
      for (const [key, val] of this.cache.entries()) {
        if (val.expiresAt < now) this.cache.delete(key);
      }
    }

    if (!record || record.expiresAt < now) {
      this.cache.set(id, { count: 1, expiresAt: now + this.windowMs });
      return { success: true, remaining: this.limit - 1, reset: now + this.windowMs };
    }

    if (record.count >= this.limit) {
      return { success: false, remaining: 0, reset: record.expiresAt };
    }

    record.count += 1;
    return { success: true, remaining: this.limit - record.count, reset: record.expiresAt };
  }
}

// Global instance for the server
export const chatRateLimiter = new RateLimiter(50, 60000); // 50 requests per minute
