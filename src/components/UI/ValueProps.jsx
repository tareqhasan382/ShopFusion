import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const perks = [
  {
    icon: Truck,
    title: "Free shipping",
    desc: "On all orders over $50",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    desc: "256-bit SSL encrypted payments",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    desc: "30-day hassle-free returns",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    desc: "We are here to help anytime",
  },
];

const ValueProps = () => {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {perks.map((perk) => (
          <div key={perk.title} className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <perk.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {perk.title}
              </p>
              <p className="text-xs text-slate-500">{perk.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValueProps;
