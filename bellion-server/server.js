require('dotenv').config();
const express = require('express');
const telegramWebhook = require('./src/webhooks/telegram');

const app = express();
app.use(express.json()); // Parses incoming JSON payloads

// Mount the WhatsApp routes
app.use('/telegram', telegramWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\\n🌑 Bellion Zero-Trust Server Online (TELEGRAM)`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Endpoint: /telegram/webhook`);
});