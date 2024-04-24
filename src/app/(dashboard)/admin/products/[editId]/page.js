import EditProduct from "@/components/Dashboard/Products/EditProduct";

const page = ({ params: { editId } }) => {
  return (
    <div className=" py-4 ">
      <h1 className=" text-heading2-bold ">Edit Product</h1>
      <div className="border-b border-gray-700 my-4"></div>
      <EditProduct productId={editId} />
    </div>
  );
};

export default page;
