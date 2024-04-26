"use client";
import { BASEURL } from "@/app/(home)/page";
import Pagination from "@/components/Dashboard/Pagination";
import FormateDate from "@/components/FormateDate";
import Loader from "@/components/Loader";
import React, { useEffect, useState } from "react";
const getCustomers = async ({ page, limit }) => {
  try {
    const result = await fetch(
      `${BASEURL}/api/customer?page=${page}&limit=${limit || ""}`,
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
const Customers = ({ searchParams }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const page = parseInt(searchParams?.page) || 1;
  const limit = 10;
  const per_page_data = 10;
  const hasPrev = per_page_data * (page - 1) > 0;
  const hasNext = per_page_data * (page - 1) + per_page_data < customers?.total;

  const customerData = async ({ page, limit }) => {
    setLoading(true);
    const data = await getCustomers({ page, limit });
    setLoading(false);
    setCustomers(data);
  };
  useEffect(() => {
    customerData({ page, limit });
  }, [page, limit]);

  return (
    <div>
      <div className=" flex flex-col gap-5 py-5 ">
        <h1 className=" text-heading2-bold "> Customers</h1>
        <div>
          <div className="border-b border-gray-700 my-4"></div>
          <div className="overflow-x-auto">
            {loading && <Loader />}
            <table className="min-w-full table-auto border-collapse">
              <thead className=" hover:bg-red-200 bg-red-300 ">
                <tr>
                  <th className="px-4 py-2  text-left">Id</th>
                  <th className="px-4 py-2  text-left">customer</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Orders</th>
                  <th className="px-4 py-2 text-left">CreatedAt</th>
                </tr>
              </thead>
              <tbody>
                {!loading && customers?.data?.length > 0 ? (
                  customers?.data.map((item) => (
                    <tr key={item._id} className=" hover:bg-gray-300 ">
                      <td className="border px-4 py-2" data-label="Name">
                        {item._id}
                      </td>
                      <td className="border px-4 py-2" data-label="Name">
                        {item?.name}
                      </td>
                      <td className="border px-4 py-2" data-label="Name">
                        {item?.email}
                      </td>
                      <td className="border px-4 py-2" data-label="Name">
                        {item?.orders.length}
                      </td>
                      <td className="border px-4 py-2" data-label="Name">
                        <FormateDate date={item?.createdAt} />
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

export default Customers;
