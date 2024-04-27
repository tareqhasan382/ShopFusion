import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Collections from "@/components/UI/Collections";
import ProductList from "@/components/UI/ProductList";

import Hero from "@/components/UI/Hero";
import Testimonials from "@/components/UI/Testimonials";
export const BASEURL = "https://shop-fusion-sage.vercel.app"; // http://localhost:3000 || https://shop-fusion-sage.vercel.app
const getCollection = async () => {
  try {
    const result = await fetch(`${BASEURL}/api/collection`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) {
      throw new Error("Failed to fetch data");
    }

    return result.json();
  } catch (error) {
    console.log(error);
  }
};
const getProduct = async () => {
  try {
    const result = await fetch(`${BASEURL}/api/product`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) {
      throw new Error("Failed to fetch data");
    }

    return result.json();
  } catch (error) {
    console.log(error);
  }
};
export const dynamic = "force-dynamic";
export default async function Home() {
  const session = await getServerSession(authOptions);
  const collectionsData = await getCollection();
  const productsData = await getProduct();
  const [collections, products] = await Promise.all([
    collectionsData,
    productsData,
  ]);

  return (
    <div>
      <Hero />
      <Collections collections={collections} />
      <ProductList products={products} />
      <Testimonials />
    </div>
  );
}
