import Link from "next/link";
import { Plus } from "lucide-react";
import Coupons from "@/components/Dashboard/Coupons";

export const metadata = { title: "Coupons | ShopFusion Admin" };

const page = () => (
  <div className="flex h-full flex-col">
    <div className="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-4">
      <h1 className="page-title">Coupons</h1>
      <Link href="/admin/coupons/new" className="btn-primary">
        <Plus className="h-4 w-4" />
        Create Coupon
      </Link>
    </div>
    <div className="min-h-0 flex-1">
      <Coupons />
    </div>
  </div>
);

export default page;
