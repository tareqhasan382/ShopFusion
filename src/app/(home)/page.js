import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Image from "next/image";
import Collections from "@/components/UI/Collections";
import ProductList from "@/components/UI/ProductList";

export const BASEURL = "http://localhost:3000";
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
export default async function Home() {
  const session = await getServerSession(authOptions);
  const collectionsData = await getCollection();
  const productsData = await getProduct();
  const [collections, products] = await Promise.all([
    collectionsData,
    productsData,
  ]);

  return (
    <>
      <Image
        src="/banner.png"
        alt="banner"
        width={2000}
        height={1000}
        className="w-screen"
      />
      <Collections collections={collections} />
      <ProductList products={products} />
    </>
  );
}
