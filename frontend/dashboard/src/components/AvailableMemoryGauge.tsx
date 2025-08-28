import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Metric } from "../hooks/useMetrics";

interface AvailableMemoryGaugeProps {
  latestMetric: Metric | undefined;
  totalMemoryGB: number; // Set this to your system's total memory in GB
}

const COLORS = ["#00C49F", "#eee"];

const AvailableMemoryGauge: React.FC<AvailableMemoryGaugeProps> = ({
  latestMetric,
  totalMemoryGB,
}) => {
  if (!latestMetric) return <div>No data available</div>;

  const usedMemory = totalMemoryGB - latestMetric.available_memory;
  const data = [
    { name: "Available", value: latestMetric.available_memory },
    { name: "Used", value: usedMemory },
  ];

  return (
    <div className="ml-5">
      <h3 className="font-bold text-lg text-center">Available Memory</h3>
      <div className="text-center font-bold text-xl">
        {latestMetric.available_memory.toFixed(2)} GB
      </div>
      <ResponsiveContainer width={100} height={100} className="mx-auto">
        <PieChart>
          <Pie
            data={data}
            innerRadius={30}
            outerRadius={50}
            startAngle={90}
            endAngle={450}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AvailableMemoryGauge;
