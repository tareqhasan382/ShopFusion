import React from "react";
import { BASEURL } from "../../page";
import ProductInfo from "@/components/UI/ProductInfo";
import Gallery from "@/components/UI/Gallery";
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
const page = async ({ params }) => {
  const getData = await getProduct(params.productId);
  //console.log("data:", getData);
  return (
    <div>
      <h1 className=" w-full text-center py-4 text-body-bold ">
        Product Details
      </h1>
      <div className="flex justify-center items-start gap-16 py-10 px-5 max-md:flex-col max-md:items-center">
        <Gallery productMedia={getData?.data?.media} />
        <ProductInfo productInfo={getData?.data} />
      </div>
    </div>
  );
};

export default page;
