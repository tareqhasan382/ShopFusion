import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductList = ({ products, limit = 8 }) => {
  const items = (products?.data || []).slice(0, limit);

  return (
    <section
      id="products"
      className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Our picks
          </p>
          <h2 className="section-title mt-2">Featured Products</h2>
        </div>
        <Link
          href="/products"
          className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:inline-flex"
        >
          View all products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">No products found.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center sm:hidden">
        <Link href="/products" className="btn-secondary">
          View all products
        </Link>
      </div>
    </section>
  );
};

export default ProductList;
