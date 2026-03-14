// server.js - Real-time Dashboard Backend
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from "public" folder
app.use(express.static('public'));

// Store latest 50 data points
let allData = [];
let dataCount = 0;

// Generate new data every 3 seconds
setInterval(() => {
    dataCount++;
    
    // Create random data
    const newData = {
        id: dataCount,
        value: Math.floor(Math.random() * 100) + 1,  // Random 1-100
        category: ['Sales', 'Users', 'Revenue'][Math.floor(Math.random() * 3)],
        region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
        timestamp: new Date().toLocaleTimeString()
    };
    
    // Add to beginning of array
    allData.unshift(newData);
    
    // Keep only last 50 items
    if (allData.length > 50) {
        allData.pop();
    }
    
    // Send to all connected clients
    io.emit('new-data', newData);
    console.log('📊 New data sent:', newData);
    
}, 3000); // 3000 milliseconds = 3 seconds

// API endpoint to get all data
app.get('/api/data', (req, res) => {
    res.json(allData);
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});