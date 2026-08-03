import BrandForm from "@/components/Dashboard/BrandForm";

export const metadata = { title: "New Brand | ShopFusion Admin" };

const page = () => (
  <div>
    <div className="mb-6">
      <h1 className="page-title">Create Brand</h1>
    </div>
    <BrandForm />
  </div>
);

export default page;
