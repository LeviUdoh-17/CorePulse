import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Metric } from '../hooks/useMetrics';


interface Props {
  data: Metric[];
}

const CpuChart: React.FC<Props> = ({ data }) => {
  return (
    <LineChart width={600} height={200} data={data}>
      <CartesianGrid strokeDasharray="9 3" />
      <XAxis dataKey="timestamp" />
      <YAxis domain={[0, 100]} unit="%" />
      <Tooltip />
      <Line type="monotone" dataKey="cpu_usage" stroke="#4f46e5" />
    </LineChart>
  );
};

export default CpuChart;
