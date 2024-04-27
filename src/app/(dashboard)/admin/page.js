import React from "react";
import { CircleDollarSign, ShoppingBag, UserRound } from "lucide-react";
import {
  getSalesPerMonth,
  getTotalCustomers,
  getTotalSales,
} from "../../../../actions/actions";
import SalesChart from "@/components/Dashboard/SalesChart";
const Dashboard = async () => {
  const totalRevenue = await getTotalSales().then((data) => data.totalRevenue);
  const totalOrders = await getTotalSales().then((data) => data.totalOrders);
  const totalCustomers = await getTotalCustomers();

  const graphData = await getSalesPerMonth();
  const [revenue, orders, customers, data] = await Promise.all([
    totalRevenue,
    totalOrders,
    totalCustomers,
    graphData,
  ]);

  // console.log("graphData:", data);
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
            <p className="text-body-bold">$ {revenue}</p>
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
            <p className="text-body-bold">{orders}</p>
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
            <p className="text-body-bold">{customers}</p>
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
          <SalesChart data={data} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
