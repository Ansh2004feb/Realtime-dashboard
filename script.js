// script.js - Frontend logic

// Connect to server
const socket = io();

// Store all data
let allData = [];

// Charts
let lineChart, barChart;
let alerts = [];

// When page loads
window.onload = function() {
    // Load initial data
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            allData = data;
            updateEverything();
        });
    
    // Setup charts
    setupCharts();
    
    // Listen for real-time updates
    socket.on('new-data', (newData) => {
        // Add to beginning
        allData.unshift(newData);
        
        // Keep last 50
        if (allData.length > 50) {
            allData.pop();
        }
        // Create alert if value > 80
if (newData.value > 80) {
    alerts.unshift(`🔴 High ${newData.category} value: ${newData.value} at ${newData.timestamp}`);
    if (alerts.length > 5) alerts.pop();
} else if (newData.value < 20) {
    alerts.unshift(`🟢 Low ${newData.category} value: ${newData.value} at ${newData.timestamp}`);
    if (alerts.length > 5) alerts.pop();
}
        
        // Update everything
        updateEverything();
    });
};
function updateAlerts() {
    const alertsDiv = document.getElementById('alerts');
    if (alerts.length === 0) {
        alertsDiv.innerHTML = '<p style="color: #64748b;">No recent alerts...</p>';
        return;
    }
    
    let html = '<ul style="list-style: none; padding: 0;">';
    alerts.forEach(alert => {
        html += `<li style="padding: 8px; margin: 5px 0; background: #f8fafc; border-radius: 5px;">${alert}</li>`;
    });
    html += '</ul>';
    alertsDiv.innerHTML = html;
}

function setupCharts() {
    // Line Chart
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Value',
                data: [],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false
        }
    });
    
    // Bar Chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Sales', 'Users', 'Revenue'],
            datasets: [{
                label: 'Total by Category',
                data: [0, 0, 0],
                backgroundColor: ['#2563eb', '#ff8c42', '#4caf50']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false
        }
    });
}

function updateEverything() {
    updateStats();
    updateCharts();
    updateTable();
    updateAlerts();
}

function updateStats() {
    if (allData.length === 0) return;
    
    // Total records
    document.getElementById('totalRecords').textContent = allData.length;
    
    // Average value
    const sum = allData.reduce((total, item) => total + item.value, 0);
    const avg = (sum / allData.length).toFixed(1);
    document.getElementById('avgValue').textContent = avg;
    
    // Last update time
    if (allData.length > 0) {
        document.getElementById('lastUpdate').textContent = allData[0].timestamp;
    }
}

function updateCharts() {
    if (allData.length === 0) return;
    
    // Update line chart (last 20)
    const last20 = allData.slice(0, 20).reverse();
    lineChart.data.labels = last20.map((_, i) => i + 1);
    lineChart.data.datasets[0].data = last20.map(item => item.value);
    lineChart.update();
    
    // Update bar chart (sum by category)
    const sales = allData.filter(item => item.category === 'Sales')
        .reduce((sum, item) => sum + item.value, 0);
    const users = allData.filter(item => item.category === 'Users')
        .reduce((sum, item) => sum + item.value, 0);
    const revenue = allData.filter(item => item.category === 'Revenue')
        .reduce((sum, item) => sum + item.value, 0);
    
    barChart.data.datasets[0].data = [sales, users, revenue];
    barChart.update();
}

function updateTable() {
    const tbody = document.getElementById('dataTable');
    tbody.innerHTML = '';
    
    if (allData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No data yet...</td></tr>';
        return;
    }
    
    // Show last 10
    allData.slice(0, 10).forEach(item => {
        const row = tbody.insertRow();
       // Determine status based on value
let status = '';
let statusColor = '';
if (item.value >= 70) {
    status = '🔴 HIGH';
    statusColor = '#ef4444';
} else if (item.value >= 40) {
    status = '🟡 MEDIUM';
    statusColor = '#f59e0b';
} else {
    status = '🟢 LOW';
    statusColor = '#10b981';
}

row.innerHTML = `
    <td>${item.value}</td>
    <td>${item.category}</td>
    <td>${item.region}</td>
    <td style="color: ${statusColor}; font-weight: bold;">${status}</td>
    <td>${item.timestamp}</td>`;
    });
}