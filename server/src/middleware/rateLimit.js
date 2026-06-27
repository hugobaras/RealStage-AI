const buckets = new Map();

export function createRateLimiter({ windowMs = 60_000, max = 60, keyFn }) {
  return (req, res, next) => {
    const key = keyFn ? keyFn(req) : req.ip;
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now - bucket.start > windowMs) {
      bucket = { start: now, count: 0 };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > max) {
      return res
        .status(429)
        .json({ error: "Trop de requêtes. Réessayez plus tard." });
    }

    return next();
  };
}

export const generateRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: 60,
  keyFn: (req) => req.user?.uid ?? req.ip,
});
