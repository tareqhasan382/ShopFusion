import { BASEURL } from "@/app/(home)/page";
import Link from "next/link";
import React from "react";
const getOrders = async () => {
  try {
    const result = await fetch(`${BASEURL}/api/order`, {
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
const Orders = async () => {
  const res = await getOrders();
  //console.log("orders:", res);

  return (
    <div className=" flex flex-col gap-5  ">
      {res.map((order) => (
        <div key={order._id} className=" bg-slate-300">
          <Link href={`/admin/orders/${order._id}`}>
            <h1>customer name : {order?.customer}</h1>
            <h1>products : {order?.products}</h1>
            <h1>totalAmount : {order?.totalAmount}</h1>
            <h1>date : {order?.createdAt}</h1>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Orders;
