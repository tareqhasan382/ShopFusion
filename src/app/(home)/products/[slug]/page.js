import { BASEURL } from "@lib/config";
import ProductInfo from "@/components/UI/ProductInfo";
import Gallery from "@/components/UI/Gallery";
import ProductCard from "@/components/UI/ProductCard";
import ReviewsSection from "@/components/UI/ReviewsSection";
import RecentlyViewedTracker from "@/components/RecentlyViewedTracker";

const getProduct = async (slug) => {
  try {
    const result = await fetch(`${BASEURL}/api/product/${slug}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) throw new Error("Failed to fetch product");
    return result.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getRelatedProducts = async (slug) => {
  try {
    const result = await fetch(`${BASEURL}/api/product/related/${slug}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) throw new Error("Failed to fetch related products");
    return result.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const generateMetadata = async ({ params }) => {
  const product = await getProduct(params?.slug);
  if (!product?.data) return { title: "Product not found" };
  return {
    title: product.data.title,
    description: product.data.description?.slice(0, 160),
    openGraph: {
      title: product.data.title,
      description: product.data.description?.slice(0, 160),
      images: product.data.media?.[0] ? [product.data.media[0]] : [],
    },
  };
};

const Details = async ({ params }) => {
  const [product, relatedProducts] = await Promise.all([
    getProduct(params?.slug),
    getRelatedProducts(params?.slug),
  ]);

  if (!product?.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
          <p className="mt-2 text-slate-500">
            The product you are looking for may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RecentlyViewedTracker product={product.data} />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-start lg:gap-16">
        <Gallery productMedia={product.data.media} />
        <div className="flex justify-center lg:justify-start">
          <ProductInfo productInfo={product.data} />
        </div>
      </div>

      {relatedProducts?.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Related Products
          </h2>
          <div className="mt-8 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <ReviewsSection
        productId={product.data._id}
        ratingAvg={product.data.ratingAvg}
        ratingCount={product.data.ratingCount}
      />
    </div>
  );
};

export default Details;
