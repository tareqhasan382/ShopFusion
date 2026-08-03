import { cancelOrderBySessionId } from "@lib/orders";
import PaymentCancelledClient from "@/components/PaymentCancelledClient";

export const dynamic = "force-dynamic";

const PaymentCancelled = async ({ searchParams }) => {
  let orderId = null;

  const sessionId = searchParams?.session_id;
  if (sessionId) {
    try {
      const { updated, order } = await cancelOrderBySessionId(sessionId);
      if (updated && order) {
        orderId = order._id?.toString() || null;
      }
    } catch (error) {
      console.error("[payment_cancelled]", error);
    }
  }

  return <PaymentCancelledClient orderId={orderId} />;
};

export default PaymentCancelled;
