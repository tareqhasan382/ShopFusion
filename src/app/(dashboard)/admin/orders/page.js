"use client";
import { BASEURL } from "@/app/(home)/page";
import Pagination from "@/components/Dashboard/Pagination";
import FormateDate from "@/components/FormateDate";
import Link from "next/link";
import React, { useEffect, useState } from "react";
const getOrders = async ({ page, limit }) => {
  try {
    const result = await fetch(
      `${BASEURL}/api/order?page=${page}&limit=${limit || ""}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
    if (!result.ok) {
      throw new Error("Failed to update data");
    }

    const data = await result.json();
    return await data;
  } catch (error) {
    console.log(error);
  }
};
const Orders = ({ searchParams }) => {
  const [res, setRes] = useState([]);
  const page = parseInt(searchParams?.page) || 1;
  const limit = 10;
  const per_page_data = 10;
  const hasPrev = per_page_data * (page - 1) > 0;
  const hasNext = per_page_data * (page - 1) + per_page_data < res?.total;
  const orderData = async ({ page, limit }) => {
    const data = await getOrders({ page, limit });
    setRes(data);
  };
  useEffect(() => {
    orderData({ page, limit });
  }, [page, limit]);
  // console.log("orders:", res);
  return (
    <div>
      <div className=" flex flex-col gap-5 py-5 ">
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className=" hover:bg-red-200 bg-red-300 ">
                <tr>
                  <th className="px-4 py-2  text-left">Id</th>
                  <th className="px-4 py-2  text-left">customer</th>
                  <th className="px-4 py-2 text-left">Products</th>
                  <th className="px-4 py-2 text-left">Totals($)</th>
                  <th className="px-4 py-2 text-left">CreatedAt</th>
                </tr>
              </thead>
              <tbody>
                {res?.paginatedOrderDetails?.length > 0 ? (
                  res?.paginatedOrderDetails?.map((item, index) => (
                    <tr key={item._id} className=" hover:bg-gray-300 ">
                      <td className="border px-4 py-2" data-label="Name">
                        <Link href={`/admin/orders/${item._id}`}>
                          {item._id}
                        </Link>
                      </td>
                      <td className="border px-4 py-2" data-label="Name">
                        <Link href={`/admin/orders/${item._id}`}>
                          {item?.customer}
                        </Link>
                      </td>
                      <td className="border px-4 py-2" data-label="Name">
                        <Link href={`/admin/orders/${item._id}`}>
                          {item?.products}
                        </Link>
                      </td>
                      <td className="border px-4 py-2" data-label="Name">
                        <Link href={`/admin/orders/${item._id}`}>
                          {item?.totalAmount}
                        </Link>
                      </td>
                      <td className="border px-4 py-2" data-label="Name">
                        <Link href={`/admin/orders/${item._id}`}>
                          <FormateDate date={item?.createdAt} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-2 text-body-bold "
                    >
                      No Data found in Orders!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Pagination page={page} hasNext={hasNext} hasPrev={hasPrev} />
    </div>
  );
};

export default Orders;
