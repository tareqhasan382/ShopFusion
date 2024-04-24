import EditProduct from "@/components/Dashboard/Products/EditProduct";

const page = ({ params: { editId } }) => {
  return (
    <div>
      <EditProduct productId={editId} />
    </div>
  );
};

export default page;
