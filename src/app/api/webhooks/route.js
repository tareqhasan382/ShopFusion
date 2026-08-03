import { stripe } from "../../../../lib/stripe";
import { confirmPaidOrder, cancelOrderBySessionId } from "../../../../lib/orders";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";

export const POST = async (req) => {
  const rawBody = await req.text();
  const signature = req.headers.get("Stripe-Signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhooks] STRIPE_WEBHOOK_SECRET is not configured.");
    return jsonError("Webhook secret is not configured.", 500);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhooks] signature verification failed:", err.message);
    return jsonError("Invalid signature.", 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      try {
        const result = await confirmPaidOrder(event.data.object);
        return jsonSuccess(
          result,
          result.created ? "Order created successfully." : "Order already exists.",
          200
        );
      } catch (err) {
        console.error("[webhooks] order confirmation failed:", err);
        return jsonError("Failed to confirm order.", 500);
      }
    }

    case "checkout.session.expired": {
      try {
        const result = await cancelOrderBySessionId(event.data.object?.id);
        return jsonSuccess(result, "Pending order cancelled.", 200);
      } catch (err) {
        console.error("[webhooks] order cancellation failed:", err);
        return jsonError("Failed to cancel order.", 500);
      }
    }

    case "payment_intent.cancelled": {
      try {
        const result = await cancelOrderByPaymentIntent(event.data.object?.id);
        return jsonSuccess(result, "Pending order cancelled.", 200);
      } catch (err) {
        console.error("[webhooks] order cancellation failed:", err);
        return jsonError("Failed to cancel order.", 500);
      }
    }

    default:
      return jsonSuccess({}, "Event ignored.", 200);
  }
};
