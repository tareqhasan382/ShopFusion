import React from "react";

const page = ({ params }) => {
  return (
    <div>
      <h1>Collection page</h1>
      <h1>{params.collectionId}</h1>
    </div>
  );
};

export default page;
