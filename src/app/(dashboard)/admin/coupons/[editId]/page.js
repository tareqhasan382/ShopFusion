import CouponForm from "@/components/Dashboard/CouponForm";
import { getSession } from "@lib/auth";
import { connectMongodb } from "@lib/mongodb";
import CouponModel from "@lib/models/CouponModel";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Coupon | ShopFusion Admin" };

const page = async ({ params }) => {
  const session = await getSession();
  if (!session || session.role !== "admin") notFound();

  await connectMongodb();
  const coupon = await CouponModel.findById(params.editId).lean();
  if (!coupon) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Edit Coupon</h1>
      </div>
      <CouponForm
        initialData={{
          _id: String(coupon._id),
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscount: coupon.maxDiscount,
          expiresAt: coupon.expiresAt,
          usageLimit: coupon.usageLimit,
          isActive: coupon.isActive,
        }}
      />
    </div>
  );
};

export default page;
