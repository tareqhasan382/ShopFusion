import CategoryForm from "@/components/Dashboard/CategoryForm";

export const metadata = { title: "New Category | ShopFusion Admin" };

const page = () => (
  <div>
    <div className="mb-6">
      <h1 className="page-title">Create Category</h1>
    </div>
    <CategoryForm />
  </div>
);

export default page;
