import CollectionForm from "@/components/Dashboard/CollectionForm";
import React from "react";

const page = () => {
  return (
    <div className=" min-w-full  flex-1 py-4 ">
      <h1 className=" text-heading2-bold ">Create Collection</h1>
      <div className="border-b border-gray-700 my-4"></div>
      <CollectionForm />
    </div>
  );
};

export default page;
