import fetch from "node-fetch";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send({ message: "Only POST allowed" });
    
    const { symbol, type, lot } = req.body;

    try {
        // Example Panda API request
        const response = await fetch('https://api.panda.com/trade', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer YOUR_PANDA_API_KEY', 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol, type, lot })
        });
        const result = await response.json();

        // Store price in Firebase (simulate history)
        const firebase = (await import('firebase-admin')).default;
        if (!firebase.apps.length) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
            firebase.initializeApp({ credential: firebase.credential.cert(serviceAccount), databaseURL: process.env.FIREBASE_DB_URL });
        }
        const db = firebase.database();
        db.ref(`prices/${symbol}`).push({ price: result.price, timestamp: Date.now() });

        res.json({ message: `${type} trade executed for ${lot} lots at ${result.price}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Trade failed" });
    }
}
