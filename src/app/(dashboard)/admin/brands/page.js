import Link from "next/link";
import { Plus } from "lucide-react";
import Brands from "@/components/Dashboard/Brands";

export const metadata = { title: "Brands | ShopFusion Admin" };

const page = () => (
  <div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="page-title">Brands</h1>
      <Link href="/admin/brands/new" className="btn-primary">
        <Plus className="h-4 w-4" />
        Create Brand
      </Link>
    </div>
    <Brands />
  </div>
);

export default page;
