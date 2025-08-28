const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // Allow all for now, tighten later
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// In-memory storage for metrics
let metricsStore = [];  // { device_id, cpu_usage, ram_usage, timestamp, ... }

// API Route
app.post('/api/metrics', (req, res) => {
  const data = req.body;
  data.timestamp = new Date().toISOString();

  // Store in memory
  metricsStore.push(data);

  // Emit via WebSocket to any connected frontends
  io.emit('new-metrics', data);

  console.log(`✅ Metrics received from ${data.device_id}`);
  res.json({ status: "success", received: data });
});

// Optional: Get all metrics (for testing)
app.get('/api/metrics', (req, res) => {
  res.json(metricsStore);
});

// Start server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
