import CategoryForm from "@/components/Dashboard/CategoryForm";
import { getSession } from "@lib/auth";
import { connectMongodb } from "@lib/mongodb";
import CategoryModel from "@lib/models/CategoryModel";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Category | ShopFusion Admin" };

const page = async ({ params }) => {
  const session = await getSession();
  if (!session || session.role !== "admin") notFound();

  await connectMongodb();
  const category = await CategoryModel.findById(params.editId).lean();
  if (!category) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Edit Category</h1>
      </div>
      <CategoryForm initialData={{ _id: String(category._id), title: category.title, description: category.description, image: category.image }} />
    </div>
  );
};

export default page;
