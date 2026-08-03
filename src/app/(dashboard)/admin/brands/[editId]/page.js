import BrandForm from "@/components/Dashboard/BrandForm";
import { getSession } from "@lib/auth";
import { connectMongodb } from "@lib/mongodb";
import BrandModel from "@lib/models/BrandModel";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Brand | ShopFusion Admin" };

const page = async ({ params }) => {
  const session = await getSession();
  if (!session || session.role !== "admin") notFound();

  await connectMongodb();
  const brand = await BrandModel.findById(params.editId).lean();
  if (!brand) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Edit Brand</h1>
      </div>
      <BrandForm initialData={{ _id: String(brand._id), name: brand.name, logo: brand.logo, description: brand.description }} />
    </div>
  );
};

export default page;
