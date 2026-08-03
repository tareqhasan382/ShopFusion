import Link from "next/link";
import React from "react";
import { Plus } from "lucide-react";
import Products from "@/components/Dashboard/Products/Products";

const page = ({ searchParams }) => {
  const page = parseInt(searchParams?.page) || 1;
  const search = searchParams?.search || "";
  const limit = parseInt(searchParams?.limit) || 10;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Create Product
        </Link>
      </div>
      <Products page={page} search={search} limit={limit} />
    </div>
  );
};

export default page;
