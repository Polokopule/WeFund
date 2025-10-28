let symbol = 'EURUSD';
let candleData = [];
let chart;

function selectSymbol(s) {
  symbol = s;
  candleData = [];
  updateChart();
}

function createChart() {
  const ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'candlestick',
    data: { datasets: [{ label: symbol, data: candleData }] },
    options: { responsive: true }
  });
}

function updateChart() {
  if (!chart) createChart();
  chart.data.datasets[0].data = candleData;
  chart.update();
}

async function fetchData() {
  try {
    const res = await fetch(`http://localhost:3000/marketdata?symbol=${symbol}`);
    const data = await res.json();
    candleData.push(...data);
    if (candleData.length > 100) candleData.shift();
    updateChart();
  } catch (err) {
    console.error(err);
  }
}

setInterval(fetchData, 1000);

async function trade(type) {
  const lot = parseFloat(document.getElementById('lot').value);
  const res = await fetch(`http://localhost:3000/trade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, lot, type })
  });
  const result = await res.json();
  alert(result.message);
}
