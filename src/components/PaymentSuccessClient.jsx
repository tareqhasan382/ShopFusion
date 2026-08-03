"use client";
import useCart from "@/store/useCart";
import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2, Clock3 } from "lucide-react";

const PaymentSuccessClient = ({ orderId, confirmError }) => {
  const cart = useCart();

  useEffect(() => {
    cart.clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <p className="text-2xl font-bold text-slate-900">Payment Successful</p>
      <p className="max-w-sm text-slate-500">
        Thank you for your purchase! A confirmation has been sent to your
        email. You can track your order anytime from your account.
      </p>

      {orderId && (
        <p className="text-sm text-slate-600">
          Order ID:{" "}
          <span className="font-semibold text-slate-900">{orderId}</span>
        </p>
      )}

      {confirmError && (
        <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
          <Clock3 className="h-4 w-4" />
          {confirmError}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link href="/orders" className="btn-primary">
          View my orders
        </Link>
        <Link href="/" className="btn-secondary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessClient;
