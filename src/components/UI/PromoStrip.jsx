import Link from "next/link";

const PromoStrip = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm">
      <p>
        Free shipping on orders over $50 · Use code{" "}
        <span className="font-bold uppercase tracking-wide">WELCOME10</span> for
        10% off{" "}
        <Link
          href="/products"
          className="ml-1 inline-flex items-center gap-0.5 font-semibold underline underline-offset-2 hover:opacity-90"
        >
          Shop now
        </Link>
      </p>
    </div>
  );
};

export default PromoStrip;
