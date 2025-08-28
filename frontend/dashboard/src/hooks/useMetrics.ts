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

// Environment-aware socket URL using Vite env variables
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    });

    socket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
    });

    socket.on('new-metrics', (data: Metric) => {
      setMetrics(prev => [...prev.slice(-19), data]);
    });

    // Cleanup function
    return () => {
      socket.disconnect();
    };
  }, []);

  console.log('Connection status:', connectionStatus);
  console.log('Metrics count:', metrics.length);
  
  return { metrics, connectionStatus };
}