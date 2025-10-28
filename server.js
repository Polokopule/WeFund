const express = require('express');
const cors = require('cors');
const { MetaApi } = require('metaapi.cloud-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const api = new MetaApi('YOUR_API_TOKEN'); // Replace with your token
const accountId = 'YOUR_ACCOUNT_ID';        // Replace with your MT account ID
let connection;

(async () => {
  const account = await api.metatraderAccountApi.getAccount(accountId);
  connection = await account.connect();
  await connection.waitSynchronized();
})();

app.get('/marketdata', async (req, res) => {
  const symbol = req.query.symbol || 'EURUSD';
  try {
    const price = await connection.getPrice(symbol);
    const tick = {
      time: Date.now(),
      open: price,
      high: price,
      low: price,
      close: price
    };
    res.json([tick]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/trade', async (req, res) => {
  const { symbol, lot, type } = req.body;
  try {
    if (type === 'BUY') await connection.createMarketBuyOrder(symbol, lot, 0, 0);
    else await connection.createMarketSellOrder(symbol, lot, 0, 0);
    res.json({ message: `${type} executed for ${symbol}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
