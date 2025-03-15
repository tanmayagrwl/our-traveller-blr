// server.js
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  // Add new client to the set
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Connected to WebSocket server'
  }));

  // Handle messages from client
  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
    
    // Echo message back to sender for confirmation
    ws.send(JSON.stringify({
      type: 'confirmation',
      message: 'Message received: ' + message.toString()
    }));
  });

  // Handle client disconnection
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Remaining clients:', clients.size);
  });
});

// REST API route to send a message to all clients
app.post('/api/send', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Broadcast message to all connected clients
  const broadcastMessage = JSON.stringify({
    type: 'broadcast',
    message: message,
    timestamp: new Date().toISOString()
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(broadcastMessage);
    }
  });

  res.json({ success: true, clientCount: clients.size });
});

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});