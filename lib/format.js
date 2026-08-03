/** Format a numeric price to a 2-decimal string, safely. */
export const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
};

/** Round a numeric price to integer minor units (for Stripe). */
export const toMinorUnits = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100);
};
