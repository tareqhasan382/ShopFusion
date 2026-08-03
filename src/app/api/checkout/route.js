import { getSessionFromRequest } from "../../../../lib/auth";
import { stripe, CHECKOUT_CURRENCY, SHIPPING_RATES, CHECKOUT_COUNTRIES } from "../../../../lib/stripe";
import { createPendingOrder } from "../../../../lib/orders";
import { validateCoupon } from "../../../../lib/coupon";
import { BASEURL } from "../../../../lib/config";
import { toMinorUnits } from "../../../../lib/format";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";

export async function OPTIONS() {
  return jsonSuccess({}, "OK");
}

export async function POST(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.checkout(ip);
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { cartItems, couponCode } = body || {};

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return jsonError("Your cart is empty.", 400);
  }

  const lineItems = [];
  let subtotalMinor = 0;
  for (const cartItem of cartItems) {
    const item = cartItem?.item;
    const price = Number(item?.price);
    const quantity = Math.max(1, parseInt(cartItem?.quantity, 10) || 1);

    if (!item?._id || !Number.isFinite(price) || price <= 0) {
      return jsonError("Your cart contains an invalid item.", 400);
    }

    const unitAmount = toMinorUnits(price);
    subtotalMinor += unitAmount * quantity;

    lineItems.push({
      price_data: {
        currency: CHECKOUT_CURRENCY,
        product_data: {
          name: String(item.title || "Product").slice(0, 200),
          metadata: {
            productId: String(item._id),
            ...(cartItem.size ? { size: String(cartItem.size) } : {}),
            ...(cartItem.color ? { color: String(cartItem.color) } : {}),
          },
        },
        unit_amount: unitAmount,
      },
      quantity,
    });
  }

  let discountAmount = 0;
  let appliedCoupon = "";
  if (couponCode) {
    const couponResult = await validateCoupon(couponCode, subtotalMinor / 100);
    if (!couponResult.valid) {
      return jsonError(couponResult.message || "This coupon code is not valid.", 422);
    }
    discountAmount = couponResult.discountAmount;
    appliedCoupon = couponResult.code;
  }

  if (discountAmount > 0) {
    const discountMinor = Math.round(discountAmount * 100);
    const discountedMinor = subtotalMinor - discountMinor;
    if (discountedMinor <= 0) {
      return jsonError("This coupon covers the full order amount.", 422);
    }
    // Proportionally reduce unit amounts so the Stripe total matches the
    // discounted total (Checkout does not accept negative line items).
    lineItems.forEach((li) => {
      li.price_data.unit_amount = Math.floor((li.price_data.unit_amount * discountedMinor) / subtotalMinor);
    });
    let diff = discountedMinor - lineItems.reduce((acc, li) => acc + li.price_data.unit_amount * li.quantity, 0);
    let i = 0;
    while (diff !== 0 && i < lineItems.length * 20) {
      const idx = i % lineItems.length;
      if (diff > 0) {
        lineItems[idx].price_data.unit_amount += 1;
        diff -= 1;
      } else if (lineItems[idx].price_data.unit_amount > 0) {
        lineItems[idx].price_data.unit_amount -= 1;
        diff += 1;
      }
      i += 1;
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      client_reference_id: session.id,
      customer_email: session.email,
      shipping_address_collection: {
        allowed_countries: CHECKOUT_COUNTRIES,
      },
      phone_number_collection: { enabled: true },
      ...(SHIPPING_RATES.length > 0 && { shipping_options: SHIPPING_RATES.map((rate) => ({ shipping_rate: rate })) }),
      metadata: {
        ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
      },
      line_items: lineItems,
      success_url: `${BASEURL}/payment_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASEURL}/payment_cancelled?session_id={CHECKOUT_SESSION_ID}`,
    });

    // Create the pending tracking order (best-effort — if this fails we still
    // let the user reach Stripe; the webhook/success page creates the paid
    // order on confirmation).
    try {
      await createPendingOrder({
        cartItems,
        userId: session.id,
        sessionId: checkoutSession.id,
        couponCode: appliedCoupon,
        discountAmount,
      });
    } catch (err) {
      console.error("[checkout_POST] pending order creation failed:", err);
    }

    return jsonSuccess(
      { url: checkoutSession.url, sessionId: checkoutSession.id },
      "Checkout session created.",
      200
    );
  } catch (err) {
    console.error("[checkout_POST]", err);
    return jsonError("Failed to create checkout session.");
  }
}
