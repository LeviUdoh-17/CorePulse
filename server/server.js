const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Environment-aware CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://core-pulse.vercel.app'] 
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
console.log('✅ Allowed CORS origins:', allowedOrigins);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In-memory storage for metrics
let metricsStore = [];

// API Route
app.post('/api/metrics', (req, res) => {
  const data = req.body;
  data.timestamp = new Date().toISOString();

  // Store in memory (keep only last 1000 entries to prevent memory issues)
  metricsStore.push(data);
  if (metricsStore.length > 1000) {
    metricsStore = metricsStore.slice(-1000);
  }

  // Emit via WebSocket to any connected frontends
  io.emit('new-metrics', data);

  console.log(`✅ Metrics received from ${data.device_id}`);
  res.json({ status: "success", received: data });
});

// Optional: Get recent metrics
app.get('/api/metrics', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const recent = metricsStore.slice(-limit);
  res.json(recent);
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Send last few metrics to new clients
  if (metricsStore.length > 0) {
    const recent = metricsStore.slice(-20);
    recent.forEach(metric => {
      socket.emit('new-metrics', metric);
    });
  }

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});