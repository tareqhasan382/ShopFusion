import Link from "next/link";
import { Plus } from "lucide-react";
import Categories from "@/components/Dashboard/Categories";

export const metadata = { title: "Categories | ShopFusion Admin" };

const page = () => (
  <div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="page-title">Categories</h1>
      <Link href="/admin/categories/new" className="btn-primary">
        <Plus className="h-4 w-4" />
        Create Category
      </Link>
    </div>
    <Categories />
  </div>
);

export default page;
