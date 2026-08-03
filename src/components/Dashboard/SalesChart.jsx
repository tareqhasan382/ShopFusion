"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const SalesChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        className="h-full w-full"
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 14,
          }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#4f46e5"
          strokeWidth={3}
          dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
