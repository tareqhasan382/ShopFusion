import { BASEURL } from "@/app/(home)/page";
import React from "react";
const getOrder = async (orderId) => {
  try {
    const result = await fetch(`${BASEURL}/api/order/${orderId}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!result.ok) {
      throw new Error("Failed to update data");
    }

    const data = await result.json();
    return await data;
  } catch (error) {
    console.log(error);
  }
};
const page = async ({ params: { orderId } }) => {
  const res = await getOrder(orderId);
  // console.log("res:", res);
  return (
    <div>
      <h1>Details page</h1>
      <h1>==========shippingAddress=========</h1>
      <p>street : {res.orderDetails.shippingAddress.street}</p>
      <p>city : {res.orderDetails.shippingAddress.city}</p>
      <p>state : {res.orderDetails.shippingAddress.state}</p>
      <p>================================================</p>
      <p>customer Id : {res.orderDetails.customerUserkId}</p>
      <p>total amount : {res.orderDetails.totalAmount}</p>
      <p>date : {res.orderDetails.createdAt}</p>
      <p>=======customer==========</p>
      <p>name : {res.customer.name}</p>
      <p>email : {res.customer.email}</p>
      <p>date : {res.customer.createdAt}</p>
    </div>
  );
};

export default page;
