import EditCollection from "@/components/Dashboard/EditCollection";

const page = ({ params: { editId } }) => {
  return (
    <div>
      <EditCollection collectionId={editId} />
    </div>
  );
};

export default page;
