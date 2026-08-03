import Image from "next/image";
import Link from "next/link";
import { Sparkles, Truck, Star, BadgeCheck } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            New Season · Up to 50% off
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Elevate your style with{" "}
            <span className="gradient-text">ShopFusion</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Discover hand-picked collections, timeless essentials and the
            latest trends — all in one place, delivered to your door.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="#collections" className="btn-primary w-full sm:w-auto">
              Shop Collections
            </Link>
            <Link href="#products" className="btn-secondary w-full sm:w-auto">
              Browse Products
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">500+</p>
              <p className="text-xs text-slate-500">Curated products</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-2xl font-extrabold text-slate-900">10k+</p>
              <p className="text-xs text-slate-500">Happy customers</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-2xl font-extrabold text-slate-900">4.9★</p>
              <p className="text-xs text-slate-500">Average rating</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-200 via-purple-200 to-rose-200 blur-2xl" />
          <Image
            src="/Shopping.png"
            alt="ShopFusion banner"
            width={800}
            height={600}
            priority
            className="relative aspect-square w-full rounded-3xl object-contain"
          />

          <div className="absolute -left-2 top-6 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur sm:-left-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">Free shipping</p>
              <p className="text-[11px] text-slate-500">On orders over $50</p>
            </div>
          </div>

          <div className="absolute -right-2 bottom-8 rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur sm:-right-5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="mt-1 text-xs font-bold text-slate-900">
              4.9/5 · 10k+ reviews
            </p>
            <p className="text-[11px] text-slate-500">Verified shoppers</p>
          </div>

          <div className="absolute -bottom-2 left-6 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-semibold text-slate-700">
              Secure checkout · 30-day returns
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
