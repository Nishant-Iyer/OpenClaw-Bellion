require('dotenv').config();
const express = require('express');
const whatsappWebhook = require('./src/webhooks/whatsapp');

const app = express();
app.use(express.json()); // Parses incoming JSON payloads

// Mount the WhatsApp routes
app.use('/whatsapp', whatsappWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\\n🌑 Bellion Zero-Trust Server Online`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Endpoint: /whatsapp/webhook`);
});