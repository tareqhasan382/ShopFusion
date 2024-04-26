"use client"
import { BASEURL } from '@/app/(home)/page';
import React, { useEffect, useState } from 'react'
import FormateDate from '../FormateDate';
import Loader from '../Loader';
import Image from 'next/image';
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
const OrderDetails = ({orderId}) => {
    const [loading, setLoading] = useState(false);
  const [res, setRes] = useState();
  const orderData = async (orderId) => {
    setLoading(true);
    const data = await getOrder(orderId);
    setLoading(false);
    setRes(data);
  };
  useEffect(() => {
    orderData(orderId);
  }, [orderId]);
  
  return (
    <div>
        <div>
      {loading && <Loader />}
      {
        res && <div className=" flex flex-col gap-5 py-5 ">
        <h1 className=" text-center text-body-bold ">Order Details</h1>
        <div className=" flex flex-col items-center justify-center ">
          <p>=======customer==========</p>
          <p>name : {res?.customer?.name}</p>
          <p>email : {res?.customer?.email}</p>
          <div className=" flex flex-row ">
            Date : <FormateDate date={res?.customer?.createdAt} />
          </div>
        </div>
        <div className=" flex flex-col items-center justify-center ">
          <h1>========shippingAddress======</h1>
          <div className=" flex flex-row ">
            Order Date : <FormateDate date={res?.orderDetails?.createdAt} />
          </div>
          <p>street : {res?.orderDetails?.shippingAddress?.street}</p>
          <p>city : {res?.orderDetails?.shippingAddress.city}</p>
          <p>state : {res?.orderDetails.shippingAddress.state}</p>
        </div>
        <div className=" flex flex-col items-center justify-center ">
          <p>===========================</p>
          <p>customer Id : {res?.orderDetails.customerUserkId}</p>
          <p>total amount : {res?.orderDetails.totalAmount}</p>
          <h1>products details</h1>
          <div className=" flex flex-wrap gap-5 ">
            {res?.orderDetails?.products.map((product, index) => (
              <div
                key={index}
                className=" flex flex-col items-center justify-center bg-slate-300 "
              >
                <Image
                  src={product?.product.media[0]}
                  alt="product Image"
                  height={100}
                  width={200}
                  priority
                />
                <p>Product id: {product?.product._id}</p>
                <p>Product title: {product?.product.title}</p>
                <p>Product category: {product?.product.category}</p>
                <p>Product quantity :{product?.quantity}</p>
                <p>Product SIze :{product?.size}</p>
                <p>Product color :{product?.color}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      }
    </div>
    </div>
  )
}

export default OrderDetails