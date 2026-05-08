const express = require('express');
const axios = require('axios');
const router = express.Router();
const { encryptData, decryptData } = require('../middleware/encryption');
const { saveInteraction, getRecentHistory } = require('../services/db');

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const META_API_TOKEN = process.env.META_API_TOKEN;
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;

// 1. Webhook Verification (GET)
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
            console.log('✅ WEBHOOK VERIFIED by Meta!');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// 2. Inbound Message Processing (POST)
router.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        res.sendStatus(200); // Acknowledge Meta immediately

        for (const entry of body.entry) {
            for (const change of entry.changes) {
                const value = change.value;
                if (value && value.messages && value.messages[0]) {
                    const message = value.messages[0];
                    const tenantId = message.from; // Phone number
                    const rawText = message.text ? message.text.body : null;

                    if (rawText) {
                        console.log(`[INGEST] Message from ${tenantId}`);
                        await handleIncomingMessage(tenantId, rawText);
                    }
                }
            }
        }
    } else {
        res.sendStatus(404);
    }
});

// Core Processing Pipeline
async function handleIncomingMessage(tenantId, rawText) {
    try {
        // Step 1: Encrypt and save user's inbound message immediately
        const encryptedInbound = encryptData(rawText);
        await saveInteraction(tenantId, 'user', encryptedInbound);

        // Step 2: Retrieve and decrypt working memory (RAM Only)
        const encryptedHistory = await getRecentHistory(tenantId, 10);
        let memoryContext = encryptedHistory.map(row => {
            return `${row.role.toUpperCase()}: ${decryptData(row.encrypted_content)}`;
        }).join('\\n');

        console.log(`[MEMORY] Decrypted context in RAM: \\n${memoryContext}`);

        // Step 3: (Phase 3 Placeholder) Call OpenClaw/Gemma API here statelessly.
        // For now, we simulate a response:
        const simulatedAIResponse = "This is Bellion (Headless). I have received your encrypted message.";

        // Step 4: Encrypt and save AI's outbound message
        const encryptedOutbound = encryptData(simulatedAIResponse);
        await saveInteraction(tenantId, 'assistant', encryptedOutbound);

        // Step 5: Dispatch back to WhatsApp Cloud API
        await sendWhatsAppMessage(tenantId, simulatedAIResponse);

    } catch (error) {
        console.error('[ERROR] Processing failed:', error);
    }
}

// Meta API Dispatcher
async function sendWhatsAppMessage(to, text) {
    if (!META_API_TOKEN || META_API_TOKEN === 'YOUR_WHATSAPP_CLOUD_API_TOKEN_HERE') {
        console.log('[WARN] Meta API Token missing. Cannot send outbound message to WhatsApp.');
        return;
    }

    try {
        await axios.post(
            `https://graph.facebook.com/v19.0/${META_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                text: { body: text },
            },
            {
                headers: {
                    'Authorization': `Bearer ${META_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`[DELIVERED] Sent message to ${to}`);
    } catch (error) {
        console.error('[ERROR] Failed to send WhatsApp message:', error.response ? error.response.data : error.message);
    }
}

module.exports = router;