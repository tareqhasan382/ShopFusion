"use client";
import { BASEURL } from "@/app/(home)/page";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { FilePenLine } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import Pagination from "../Pagination";
import Loader from "@/components/Loader";


const Products = ({ page }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const per_page_data = 10;
  const hasPrev = per_page_data * (page - 1) > 0;
  const hasNext =
    per_page_data * (page - 1) + per_page_data < products?.total;

  useEffect(() => {
    const getCollection = async () => {
      setLoading(true);
      try {
        const result = await fetch(
          `${BASEURL}/api/product?page=${page}&limit=${limit || ""}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        if (!result.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await result.json();
        setLoading(false);
        setProducts(data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    getCollection();
  }, [page]);

  const handleDelete = async (productId) => {
  try {
    setLoading(true);
    const result = await fetch(`${BASEURL}/api/product/${productId}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!result.ok) {
      throw new Error("Failed to delete data");
    }

    setLoading(false);
    
    // Refetch the collection data after successful delete
    const newResult = await fetch(
      `${BASEURL}/api/product?page=${page}&limit=${limit || ""}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!newResult.ok) {
      throw new Error("Failed to fetch updated data");
    }

    const newData = await newResult.json();
    setProducts(newData);
    toast.success("Delete successful");
  } catch (error) {
    setLoading(false);
    console.log(error);
  }
};
 //console.log("products:",products)
  return (
    <div>
      <div className=" flex flex-col gap-5 py-5 ">
        
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className=" hover:bg-red-200 bg-red-300 ">
                <tr>
                  <th className="px-4 py-2  text-left">Title</th>
                  <th className="px-4 py-2  text-left">Cost($)</th>
                  <th className="px-4 py-2  text-left">Price($)</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
              {loading && <tr className="flex items-center justify-center h-full "><td className="animate-spin rounded-full border-t-4 border-blue-500 border-solid h-12 w-12"></td></tr>}
                {products?.data?.length>0? products?.data?.map((item, index) => (
                  <tr key={index} className=" hover:bg-gray-300 ">
                    <td className="border px-4 py-2" data-label="Name">
                      {item?.title}
                    </td>
                    <td className="border px-4 py-2" data-label="Name">
                    
                    {parseFloat(item?.cost?.["$numberDecimal"] ?? 0).toFixed(2)}
                    </td>
                    <td className="border px-4 py-2" data-label="Name">
                    
                    {parseFloat(item?.price?.["$numberDecimal"] ?? 0).toFixed(2)}
                    </td>
                    <td
                      className="border px-4 py-2 flex flex-row gap-4 "
                      data-label="Name"
                    >
                      <button
                        disabled={loading}
                        onClick={() => handleDelete(item?._id)}
                        className=" cursor-pointer "
                      >
                       
                        <Trash2 />
                      </button>
                      <Link href={`/admin/products/${item._id}`}>
                      <button
                        disabled={loading}
                        className={` ${
                          loading && " cursor-not-allowed"
                        } cursor-pointer`}
                      >
                       
                        <FilePenLine />
                      </button>
                      </Link>
                      
                    </td>
                  </tr>
                )) :  <tr>
                <td colSpan="4" className="text-center py-2 text-body-bold ">No Data found in products!</td>
              </tr>}
              </tbody>
            </table>
          </div>
        </div>
       
      </div>
      <Pagination page={page} hasNext={hasNext} hasPrev={hasPrev} />
    </div>
  );
};

export default Products;
