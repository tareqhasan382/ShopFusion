import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const MAX_FEATURED = 3;

const Collections = ({ collections }) => {
  const featured = (collections?.data || [])
    .filter((collection) => collection.image)
    .slice(0, MAX_FEATURED);

  return (
    <section id="collections" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Shop by category
          </p>
          <h2 className="section-title mt-2">Collections</h2>
        </div>
        <Link
          href="/collections"
          className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:inline-flex"
        >
          View all collections <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {featured.length === 0 ? (
        <p className="mt-10 text-slate-500">No collections found.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((collection) => (
            <Link
              key={collection._id}
              href={`/collections/${collection._id}`}
              className="group relative overflow-hidden rounded-2xl bg-slate-100"
            >
              <Image
                src={collection.image}
                alt={collection.title}
                width={700}
                height={420}
                className="aspect-[5/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              {(collection.products?.length ?? 0) > 0 && (
                <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
                  {collection.products.length} items
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-lg font-bold text-white">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/80">
                    {collection.description}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white">
                  Shop now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 text-center sm:hidden">
        <Link href="/collections" className="btn-secondary">
          View all collections
        </Link>
      </div>
    </section>
  );
};

export default Collections;
