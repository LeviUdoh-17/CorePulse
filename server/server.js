const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// 💥 Debug: Log current NODE_ENV and FRONTEND_URL
console.log("🌐 NODE_ENV:", process.env.NODE_ENV);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);

// ✅ Fix CORS trailing slash and log origins
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL?.replace(/\/$/, '') || 'https://core-pulse.vercel.app']
  : ['http://localhost:5173', 'http://localhost:3000'];

console.log('✅ Allowed CORS origins:', allowedOrigins);

const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});

// 🛡️ Middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 🧠 In-memory store
let metricsStore = [];

// 📨 Metrics POST
app.post('/api/metrics', (req, res) => {
  const data = req.body;
  data.timestamp = new Date().toISOString();

  console.log('📥 Metric POST received:', data);

  metricsStore.push(data);
  if (metricsStore.length > 1000) {
    metricsStore = metricsStore.slice(-1000);
  }

  // ✅ Emit to all sockets
  console.log(`📡 Emitting to ${io.engine.clientsCount} client(s)`);
  io.emit('new-metrics', data);

  console.log(`✅ Metrics received from ${data.device_id}`);
  res.json({ status: "success", received: data });
});

// 🧾 Optional: Get recent metrics
app.get('/api/metrics', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const recent = metricsStore.slice(-limit);
  console.log(`📤 GET /api/metrics → sending last ${recent.length} entries`);
  res.json(recent);
});

// 🔌 Socket.io connections
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Show current socket count
  console.log('📊 Total connected sockets:', io.of("/").sockets.size);

  // Emit initial metrics history
  if (metricsStore.length > 0) {
    const recent = metricsStore.slice(-20);
    console.log(`📤 Sending ${recent.length} metrics to new client`);
    recent.forEach(metric => {
      socket.emit('new-metrics', metric);
    });
  }

  // Listen for ping-test from frontend
  socket.on('ping-test', () => {
    console.log('📶 Received ping-test from client:', socket.id);
    socket.emit('pong-test', 'Pong from server 🏓');
  });

  socket.onAny((event, ...args) => {
    console.log(`📥 [Socket Event from ${socket.id}] ${event}:`, args);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} | Reason: ${reason}`);
    console.log('📊 Remaining sockets:', io.of("/").sockets.size);
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
