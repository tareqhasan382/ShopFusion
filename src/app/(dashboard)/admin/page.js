"use client";
import React, { useEffect, useState } from "react";
import { CircleDollarSign, ShoppingBag, UserRound } from "lucide-react";
import { BASEURL } from "@/app/(home)/page";
import SalesChart from "@/components/Dashboard/SalesChart";
const getTotalSales = async () => {
  try {
    const result = await fetch(`${BASEURL}/api/admin/orders`, {
      method: "GET",
      next: { revalidate: 60 },
    });
    if (!result.ok) {
      throw new Error("Failed to fetch data");
    }

    return result.json();
  } catch (error) {
    console.log(error);
  }
};
const getTotalCustomers = async () => {
  try {
    const result = await fetch(`${BASEURL}/api/admin/customers`, {
      method: "GET",
      next: { revalidate: 60 },
    });
    if (!result.ok) {
      throw new Error("Failed to fetch data");
    }

    return result.json();
  } catch (error) {
    console.log(error);
  }
};
const getSalesPerMonth = async () => {
  try {
    const result = await fetch(`${BASEURL}/api/admin/graphdata`, {
      method: "GET",
      next: { revalidate: 60 },
    });
    if (!result.ok) {
      throw new Error("Failed to fetch data");
    }

    return result.json();
  } catch (error) {
    console.log(error);
  }
};
//next:{revalidate:60}
const Dashboard = () => {
  const [revenue, setRevenue] = useState();
  const [orders, setOrders] = useState();
  const [customers, setCustomers] = useState();
  const [data, setData] = useState();
  const getData = async () => {
    const totalRevenue = await getTotalSales();
    setRevenue(totalRevenue);
    const totalOrders = await getTotalSales();
    setOrders(totalOrders);
    const totalCustomers = await getTotalCustomers();
    setCustomers(totalCustomers);
    const graphData = await getSalesPerMonth();
    setData(graphData);
  };
  useEffect(() => {
    getData();
  }, []);
  // const [revenue, orders, customers, data] = await Promise.all([
  //   totalRevenue,
  //   totalOrders,
  //   totalCustomers,
  //   graphData,
  // ]);

  return (
    <div className=" py-10">
      <p className="text-heading2-bold">Dashboard</p>
      <div className="border-b border-gray-700 my-4"></div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
        <div className=" flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm gap-4 py-5 items-center justify-center ">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              Total Revenue
            </h1>
            <CircleDollarSign />
          </div>
          <div>
            <p className="text-body-bold">$ {revenue?.totalRevenue}</p>
          </div>
        </div>

        <div className=" flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm gap-4 py-5 items-center justify-center">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              Total Orders
            </h1>
            <ShoppingBag />
          </div>
          <div>
            <p className="text-body-bold">{orders?.totalOrders}</p>
          </div>
        </div>

        <div className=" flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm gap-4 py-5 items-center justify-center">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              Total Customer
            </h1>
            <UserRound />
          </div>
          <div>
            <p className="text-body-bold">{customers?.totalCustomers}</p>
          </div>
        </div>
      </div>

      <div className=" flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm gap-4 p-5 my-5 ">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            Sales Chart ($)
          </h1>
        </div>
        <div>
          <SalesChart data={data?.graphData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
