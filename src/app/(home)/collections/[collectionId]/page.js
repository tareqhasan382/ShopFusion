import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BASEURL } from "@lib/config";
import CollectionProducts from "@/components/UI/CollectionProducts";

const getCollection = async (collectionId) => {
  try {
    const result = await fetch(`${BASEURL}/api/collection/${collectionId}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) throw new Error("Failed to fetch collection");
    return result.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const generateMetadata = async ({ params }) => {
  const data = await getCollection(params?.collectionId);
  if (!data?.data) return { title: "Collection not found" };
  return {
    title: data.data.title,
    description: data.data.description?.slice(0, 160),
  };
};

const Collection = async ({ params }) => {
  const data = await getCollection(params?.collectionId);
  const collection = data?.data;

  if (!collection) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Collection not found
          </h1>
          <p className="mt-2 text-slate-500">
            The collection you are looking for may have been removed.
          </p>
          <Link href="/collections" className="btn-primary mt-6">
            Browse all collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-slate-500"
      >
        <Link href="/" className="transition-colors hover:text-indigo-600">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link href="/collections" className="transition-colors hover:text-indigo-600">
          Collections
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-medium text-slate-900">{collection.title}</span>
      </nav>

      <div className="relative mt-6 overflow-hidden rounded-2xl bg-slate-900">
        {collection.image && (
          <Image
            src={collection.image}
            alt={collection.title}
            width={1200}
            height={400}
            className="h-64 w-full object-cover opacity-80 sm:h-80"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/70 via-black/30 to-black/10 px-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      <CollectionProducts collectionId={params.collectionId} />
    </div>
  );
};

export default Collection;
