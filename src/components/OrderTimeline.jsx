import {
  ORDER_TIMELINE,
  ORDER_STATUS_STYLES,
  orderStatusLabel,
} from "@lib/orderStatus";
import { Check, X } from "lucide-react";

const OrderTimeline = ({ status }) => {
  const isTerminal = status === "cancelled" || status === "returned";
  const currentIndex = ORDER_TIMELINE.indexOf(status);
  const activeIndex = isTerminal ? ORDER_TIMELINE.indexOf("placed") : currentIndex;

  return (
    <div className="w-full">
      {isTerminal ? (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-inset ${
            ORDER_STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
          }`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70">
            <X className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">{orderStatusLabel(status)}</p>
            <p className="text-xs opacity-80">
              This order is {status} and will not continue through fulfillment.
            </p>
          </div>
        </div>
      ) : (
        <ol className="flex items-center">
          {ORDER_TIMELINE.map((step, index) => {
            const isComplete = index <= activeIndex;
            const isCurrent = index === activeIndex;
            return (
              <li
                key={step}
                className={`flex items-center ${
                  index < ORDER_TIMELINE.length - 1 ? "flex-1" : ""
                }`}
              >
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      isComplete
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {orderStatusLabel(step)}
                  </span>
                </div>
                {index < ORDER_TIMELINE.length - 1 && (
                  <div
                    className={`mx-2 mb-5 h-0.5 flex-1 rounded ${
                      index < activeIndex
                        ? "bg-indigo-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default OrderTimeline;
