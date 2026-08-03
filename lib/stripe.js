import Stripe from "stripe";

const apiVersion = "2024-04-10";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  { apiVersion }
);

/** Publishable key — used client-side (Stripe.js). Supports the canonical
 *  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY name plus the legacy PUBLIC_KEY alias. */
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  "pk_test_placeholder";

export const CHECKOUT_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "usd";

export const SHIPPING_RATES = [
  process.env.STRIPE_SHIPPING_RATE_STANDARD,
  process.env.STRIPE_SHIPPING_RATE_EXPRESS,
].filter(Boolean);

export const CHECKOUT_COUNTRIES = (process.env.CHECKOUT_COUNTRIES || "US,BD,IN")
  .split(",")
  .map((c) => c.trim())
  .filter(Boolean);
