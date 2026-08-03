import Newsletter from "@/components/Dashboard/Newsletter";

export const metadata = { title: "Newsletter | ShopFusion Admin" };

const page = () => (
  <div className="flex h-full flex-col">
    <div className="mb-6 shrink-0">
      <h1 className="page-title">Newsletter Subscribers</h1>
    </div>
    <div className="min-h-0 flex-1">
      <Newsletter />
    </div>
  </div>
);

export default page;
