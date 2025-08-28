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

// 👇 Confirm VITE_API_URL is loaded correctly
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
console.log("🧪 SOCKET_URL from Vite env:", SOCKET_URL);

export default function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    console.log("🌍 Attempting to connect to Socket.io server at:", SOCKET_URL);

    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    // 🔍 Expose for browser debugging
    if (typeof window !== 'undefined') {
      (window as any).corePulseSocket = socket;
    }

    // 📡 Listen for all events (super useful)
    socket.onAny((event, ...args) => {
      console.log(`📥 [Socket Event] ${event}:`, args);
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnectionStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected (${reason})`);
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('🚫 Connection error:', err.message, err);
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect_attempt', () => {
      console.log('🔁 Reconnect attempt...');
    });

    socket.on('reconnect_failed', () => {
      console.error('🛑 Reconnect failed');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 Reconnected successfully after ${attemptNumber} attempts`);
    });

    socket.on('new-metrics', (data: Metric) => {
      console.log('📊 New metric received:', data);
      setMetrics(prev => [...prev.slice(-19), data]);
    });

    // 🔚 Cleanup
    return () => {
      console.log('🔌 Disconnecting socket...');
      socket.disconnect();
    };
  }, []);

  // 📦 Expose debug info to console
  if (typeof window !== 'undefined') {
    (window as any).corePulseDebug = {
      connectionStatus,
      metrics,
      SOCKET_URL,
    };
  }

  console.log('🧠 useMetrics State → Connection:', connectionStatus, '| Metrics count:', metrics.length);
  
  return { metrics, connectionStatus };
}
