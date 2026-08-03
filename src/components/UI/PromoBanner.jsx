import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PromoBanner = () => {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 px-8 py-14 text-center sm:px-16">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        <span className="relative inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
          Limited time offer
        </span>
        <h2 className="relative mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Summer Sale — up to 50% off
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">
          Refresh your wardrobe with fresh arrivals. Free shipping on orders
          over $50, plus an extra 10% off your first order with code
          WELCOME10.
        </p>
        <div className="relative mt-7">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Shop the sale <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
