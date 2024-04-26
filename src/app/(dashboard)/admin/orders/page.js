import { BASEURL } from "@/app/(home)/page";
import Pagination from "@/components/Dashboard/Pagination";
import FormateDate from "@/components/FormateDate";
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
                {res?.length > 0 ? (
                  res?.map((item, index) => (
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
      {/* <Pagination page={page} hasNext={hasNext} hasPrev={hasPrev} /> */}
    </div>
  );
};

export default Orders;
