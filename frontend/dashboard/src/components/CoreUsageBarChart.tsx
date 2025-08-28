import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Metric } from '../hooks/useMetrics';

interface CoreUsageBarChartProps {
  latestMetric: Metric | undefined;
}

const CoreUsageBarChart: React.FC<CoreUsageBarChartProps> = ({ latestMetric }) => {
  if (!latestMetric) return <div>No data available</div>;

  // Prepare data for the bar chart: [{ core: 'Core 1', usage: 23 }, ...]
  const data = latestMetric.core_usage.map((usage, idx) => ({
    core: `Core ${idx + 1}`,
    usage,
  }));

  return (
    <div>
      <h3 className="font-bold text-lg mb-2">Current CPU Core Usage</h3>
      <ResponsiveContainer width={400} height={150}>
        <BarChart data={data}>
          <XAxis dataKey="core" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="usage" fill="#8884d8" name="Usage (%)" width={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CoreUsageBarChart;