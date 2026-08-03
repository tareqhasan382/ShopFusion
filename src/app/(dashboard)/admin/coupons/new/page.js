import CouponForm from "@/components/Dashboard/CouponForm";

export const metadata = { title: "New Coupon | ShopFusion Admin" };

const page = () => (
  <div>
    <div className="mb-6">
      <h1 className="page-title">Create Coupon</h1>
    </div>
    <CouponForm />
  </div>
);

export default page;
