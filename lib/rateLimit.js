/**
 * Simple in-memory sliding-window rate limiter.
 *
 * NOTE: For horizontally scaled production deployments (Vercel, multiple
 * instances) replace this with a shared store such as Upstash Redis or
 * PlanetScale + a distributed lock. This implementation is correct for a
 * single instance and protects against basic abuse / brute-force attempts.
 */

const stores = new Map();

const pruneWindow = (store, key, windowMs) => {
  const now = Date.now();
  const timestamps = store.get(key) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  store.set(key, recent);
  return recent;
};

/**
 * @param {Object} options
 * @param {number} options.limit   - max requests per window
 * @param {number} options.windowMs - window length in milliseconds
 * @param {string} options.name     - unique bucket name
 */
export const rateLimit = ({ limit = 20, windowMs = 60_000, name = "default" }) => {
  if (!stores.has(name)) stores.set(name, new Map());
  const store = stores.get(name);

  return (key) => {
    const recent = pruneWindow(store, key, windowMs);
    if (recent.length >= limit) {
      const retryAfter = Math.ceil(
        (recent[0] + windowMs - Date.now()) / 1000
      );
      return { ok: false, retryAfter: Math.max(retryAfter, 1) };
    }
    recent.push(Date.now());
    return { ok: true };
  };
};

/** Best-effort client IP detection. */
export const clientIp = (req) => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
};

export const AUTH_RATE_LIMITS = {
  login: rateLimit({ limit: 10, windowMs: 15 * 60_000, name: "login" }),
  register: rateLimit({ limit: 5, windowMs: 60 * 60_000, name: "register" }),
  wishlist: rateLimit({ limit: 60, windowMs: 60_000, name: "wishlist" }),
  checkout: rateLimit({ limit: 20, windowMs: 60_000, name: "checkout" }),
  write: rateLimit({ limit: 120, windowMs: 60_000, name: "write" }),
  contact: rateLimit({ limit: 5, windowMs: 60_000, name: "contact" }),
  review: rateLimit({ limit: 10, windowMs: 60_000, name: "review" }),
  coupon: rateLimit({ limit: 30, windowMs: 60_000, name: "coupon" }),
  newsletter: rateLimit({ limit: 10, windowMs: 60_000, name: "newsletter" }),
  passwordReset: rateLimit({ limit: 5, windowMs: 60 * 60_000, name: "passwordReset" }),
};
