import EditCollection from "@/components/Dashboard/EditCollection";

const page = ({ params: { editId } }) => {
  return (
    <div className="py-4">
      <h1 className=" text-heading2-bold ">Edit Collection</h1>
      <div className="border-b border-gray-700 my-4"></div>
      <EditCollection collectionId={editId} />
    </div>
  );
};

export default page;
