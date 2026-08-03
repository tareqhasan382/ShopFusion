import { BASEURL } from "@lib/config";
import Collections from "@/components/UI/Collections";
import ProductList from "@/components/UI/ProductList";
import Hero from "@/components/UI/Hero";
import Testimonials from "@/components/UI/Testimonials";
import RecentlyViewed from "@/components/RecentlyViewed";
import PromoStrip from "@/components/UI/PromoStrip";
import ValueProps from "@/components/UI/ValueProps";
import PromoBanner from "@/components/UI/PromoBanner";

export const dynamic = "force-dynamic";

const getCollections = async () => {
  try {
    const result = await fetch(`${BASEURL}/api/collection?limit=100&sort=popular`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) throw new Error("Failed to fetch collections");
    return result.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getProducts = async () => {
  try {
    const result = await fetch(`${BASEURL}/api/product?limit=8`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) throw new Error("Failed to fetch products");
    return result.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function Home() {
  const [collectionsData, productsData] = await Promise.all([
    getCollections(),
    getProducts(),
  ]);

  return (
    <div>
      <PromoStrip />
      <Hero />
      <Collections collections={collectionsData} />
      <ValueProps />
      <ProductList products={productsData} />
      <PromoBanner />
      <RecentlyViewed />
      <Testimonials />
    </div>
  );
}
