"use client";
import Link from "next/link";
import { XCircle, ArrowRight } from "lucide-react";

const PaymentCancelledClient = ({ orderId }) => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <XCircle className="h-16 w-16 text-slate-300" />
      <p className="text-2xl font-bold text-slate-900">Payment Cancelled</p>
      <p className="max-w-sm text-slate-500">
        Your payment wasn&apos;t completed, so nothing was charged. Your cart is
        still saved — you can try again whenever you&apos;re ready.
      </p>

      {orderId && (
        <p className="text-sm text-slate-600">
          Attempt recorded as{" "}
          <span className="font-semibold text-slate-900">Order ID: {orderId}</span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link href="/cart" className="btn-primary">
          Return to cart <ArrowRight className="ml-1 inline h-4 w-4" />
        </Link>
        <Link href="/" className="btn-secondary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelledClient;
