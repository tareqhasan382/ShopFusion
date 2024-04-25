import { BASEURL } from '@/app/(home)/page';
import React from 'react'
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
      return data
    } catch (error) {
      console.log(error);
    }
  };

const ProductDetails =async ({productId}) => {
    const getData=await getProduct(productId)
    console.log("data:",getData)
  return (
    <div>
        <h1>ProductDetails</h1>
        <h1>{productId}</h1>
    </div>
  )
}

export default ProductDetails;