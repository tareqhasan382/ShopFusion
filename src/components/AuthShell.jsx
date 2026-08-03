import Link from "next/link";

const benefits = [
  "Hand-picked collections curated weekly",
  "Fast, secure checkout powered by Stripe",
  "Track your orders in real time",
];

export const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen bg-white">
    <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
      <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10" />

      <Link href="/" className="relative flex items-center gap-2">
        <span className="text-2xl font-extrabold tracking-tight">ShopFusion</span>
      </Link>

      <div className="relative">
        <h2 className="text-3xl font-bold leading-tight text-white">
          Your one-stop shop for style, quality and convenience.
        </h2>
        <ul className="mt-8 space-y-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-sm text-indigo-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-indigo-200">
        © {new Date().getFullYear()} ShopFusion. All rights reserved.
      </p>
    </div>

    <div className="flex w-full items-center justify-center px-4 py-12 sm:px-8 lg:w-1/2">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
          <span className="gradient-text text-2xl font-extrabold tracking-tight">
            ShopFusion
          </span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

        <div className="mt-8">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  </div>
);
