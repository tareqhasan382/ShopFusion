import EditCollection from "@/components/Dashboard/EditCollection";

const page = ({ params: { editId } }) => {
  return (
    <div>
      <h1 className="page-title mb-6">Edit Collection</h1>
      <EditCollection collectionId={editId} />
    </div>
  );
};

export default page;
