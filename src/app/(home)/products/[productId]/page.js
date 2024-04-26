import React from "react";
import { BASEURL } from "../../page";
import ProductInfo from "@/components/UI/ProductInfo";
import Gallery from "@/components/UI/Gallery";
import ProductCard from "@/components/UI/ProductCard";
const getProduct = async (productId) => {
  try {
    const result = await fetch(`${BASEURL}/api/product/${productId}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await result.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
const getreleteProduct = async (productId) => {
  try {
    const result = await fetch(`${BASEURL}/api/product/related/${productId}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await result.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
const Details = async ({ params }) => {
  const getData = await getProduct(params?.productId);
  const relatedData = await getreleteProduct(params?.productId);
  const [products, relatedProducts] = await Promise.all([getData, relatedData]);
  return (
    <div>
      <h1 className=" w-full text-center py-4 text-body-bold ">
        Product Details
      </h1>
      <div className="flex justify-center items-start gap-16 py-10 px-5 max-md:flex-col max-md:items-center">
        <Gallery productMedia={products?.data?.media} />
        <ProductInfo productInfo={products?.data} />
      </div>
      <div>
        <div className="flex flex-col items-center px-10 py-5 max-md:px-3">
          <p className="text-heading3-bold">Related Products</p>
          <div className="flex flex-wrap gap-16 mx-auto mt-8 items-center justify-center ">
            {relatedProducts?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
/*
{relatedProducts?.map((product: ProductType) => (
          <ProductCard key={product._id} product={product} />
        ))}
*/
