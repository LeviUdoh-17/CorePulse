import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Metric {
  device_id: string;
  cpu_usage: number;
  ram_usage: number;
  power_microjoules?: number | null;
  timestamp: string;
  battery: number;
  charging: boolean;
  core_usage: number[];
  cpu_clock_speed: number;
  available_memory: number;
  wallpaper: string | null;
}

const SOCKET_URL = "http://localhost:4000";

export default function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
  const socket: Socket = io(SOCKET_URL);

  socket.on('new-metrics', (data: Metric) => {
    setMetrics(prev => [...prev.slice(-19), data]);
  });

  // cleanup function
  return () => {
    socket.disconnect();
  };
}, []);

  console.log(metrics)
  return metrics;
}
