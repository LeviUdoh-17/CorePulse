import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Metric } from '../hooks/useMetrics';

interface CpuDualAxisChartProps {
  data: Metric[];
}

const CpuDualAxisChart: React.FC<CpuDualAxisChartProps> = ({ data }) => {
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">CPU Usage & Clock Speed</h3>
      <ResponsiveContainer width={400} height={340}>
        <ComposedChart data={data}>
          <XAxis dataKey="timestamp" tick={false} />
          <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'CPU Usage (%)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} label={{ value: 'Clock Speed (GHz)', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="cpu_usage" fill="#8884d8" name="CPU Usage (%)" />
          <Line yAxisId="right" type="monotone" dataKey="cpu_clock_speed" stroke="#82ca9d" name="Clock Speed (GHz)" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CpuDualAxisChart;