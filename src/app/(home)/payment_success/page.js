import { confirmPaidOrder } from "@lib/orders";
import PaymentSuccessClient from "@/components/PaymentSuccessClient";

export const dynamic = "force-dynamic";

const PaymentSuccess = async ({ searchParams }) => {
  let orderId = null;
  let confirmError = null;

  const sessionId = searchParams?.session_id;
  if (sessionId) {
    try {
      const { order, paid } = await confirmPaidOrder({ id: sessionId });
      if (paid) {
        orderId = order?._id?.toString() || null;
      } else {
        confirmError = "Payment has not been completed yet.";
      }
    } catch (error) {
      console.error("[payment_success]", error);
      confirmError =
        "We could not confirm your order right now. It may still be created shortly.";
    }
  }

  return <PaymentSuccessClient orderId={orderId} confirmError={confirmError} />;
};

export default PaymentSuccess;
