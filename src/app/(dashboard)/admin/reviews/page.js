import Reviews from "@/components/Dashboard/Reviews";

export const metadata = { title: "Reviews | ShopFusion Admin" };

const page = () => (
  <div className="flex h-full flex-col">
    <div className="mb-6 shrink-0">
      <h1 className="page-title">Product Reviews</h1>
    </div>
    <div className="min-h-0 flex-1">
      <Reviews />
    </div>
  </div>
);

export default page;
