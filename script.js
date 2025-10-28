// Firebase config
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_FIREBASE_PROJECT.firebaseio.com",
    projectId: "YOUR_FIREBASE_PROJECT",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let selectedSymbol = 'EURUSD';
let chart;
let chartData = { labels: [], datasets: [{ label: selectedSymbol, data: [], borderColor: 'lime', tension: 0.3 }] };

function selectSymbol(symbol) {
    selectedSymbol = symbol;
    chartData.datasets[0].label = symbol;
    chartData.labels = [];
    chartData.datasets[0].data = [];
}

// Setup Chart.js
function initChart() {
    const ctx = document.createElement('canvas');
    document.getElementById('chart').appendChild(ctx);
    chart = new Chart(ctx, { type: 'line', data: chartData, options: { responsive: true } });
}

// Poll prices from Firebase
function pollPrices() {
    db.ref(`prices/${selectedSymbol}`).limitToLast(100).on('child_added', snapshot => {
        chartData.labels.push(new Date(snapshot.val().timestamp).toLocaleTimeString());
        chartData.datasets[0].data.push(snapshot.val().price);
        chart.update();
    });
}

// Execute trade
async function executeTrade(type) {
    const lot = document.getElementById('lot').value;
    if (!lot) return alert("Enter lot size!");
    
    const res = await fetch('/trade.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol, type, lot })
    });
    
    const data = await res.json();
    alert(data.message);
}

initChart();
pollPrices();
