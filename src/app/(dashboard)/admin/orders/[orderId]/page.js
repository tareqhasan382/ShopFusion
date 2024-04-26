import OrderDetails from "@/components/Dashboard/OrderDetails";
import React from "react";

const Details = ({ params: { orderId } }) => {
  return <OrderDetails orderId={orderId} />;
};

export default Details;
