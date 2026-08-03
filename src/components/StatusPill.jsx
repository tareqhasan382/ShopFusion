import {
  PAYMENT_STATUS_STYLES,
  ORDER_STATUS_STYLES,
  paymentStatusLabel,
  orderStatusLabel,
} from "@lib/orderStatus";

const StatusPill = ({ kind, value, label }) => {
  const styles =
    kind === "payment"
      ? PAYMENT_STATUS_STYLES[value]
      : ORDER_STATUS_STYLES[value];

  const text =
    label ||
    (kind === "payment"
      ? paymentStatusLabel(value)
      : orderStatusLabel(value));

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${
        styles || "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      {text}
    </span>
  );
};

export default StatusPill;
