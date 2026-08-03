import EditProduct from "@/components/Dashboard/Products/EditProduct";

const page = ({ params: { editId } }) => {
  return (
    <div>
      <h1 className="page-title mb-6">Edit Product</h1>
      <EditProduct productId={editId} />
    </div>
  );
};

export default page;
