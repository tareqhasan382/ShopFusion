import Link from "next/link";
import React from "react";
import { Plus } from "lucide-react";
import Products from "@/components/Dashboard/Products/Products";
const page = ({ searchParams }) => {
  const page = parseInt(searchParams?.page) || 1;
  return (
    <div className=" min-w-full  flex-1 py-4 ">
      <div className=" flex items-center gap-5 justify-between ">
        <h1 className=" text-heading2-bold "> Products</h1>
        <Link href="/admin/products/new">
          <button className=" bg-blue-600 text-white text-small-bold rounded-lg px-4 py-2 flex items-center ">
            <Plus color="#FFFFFF" /> Create Product
          </button>
        </Link>
      </div>
      <div className="border-b border-gray-700 my-4"></div>
      <Products page={page} />
    </div>
  );
};

export default page;
