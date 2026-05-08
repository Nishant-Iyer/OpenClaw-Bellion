const express = require('express');
const axios = require('axios');
const router = express.Router();
const { encryptData, decryptData } = require('../middleware/encryption');
const { saveInteraction, getRecentHistory } = require('../services/db');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MY_TELEGRAM_ID = process.env.MY_TELEGRAM_ID;

// Telegram Webhook Endpoint
router.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.message) {
        res.sendStatus(200); // Acknowledge Telegram immediately

        const message = body.message;
        const chatId = message.chat.id.toString();
        const rawText = message.text;

        // Security: Only process messages from your specific ID
        if (chatId === MY_TELEGRAM_ID && rawText) {
            console.log(`[INGEST] Telegram message from Authorized User`);
            await handleIncomingMessage(chatId, rawText);
        } else if (rawText) {
            console.warn(`[WARN] Unauthorized access attempt from: ${chatId}`);
        }
    } else {
        res.sendStatus(200);
    }
});

// Core Processing Pipeline (Migrated from WhatsApp)
async function handleIncomingMessage(chatId, rawText) {
    try {
        // Step 1: Encrypt and save user's inbound message immediately
        const encryptedInbound = encryptData(rawText);
        await saveInteraction(chatId, 'user', encryptedInbound);

        // Step 2: Retrieve and decrypt working memory (RAM Only)
        const encryptedHistory = await getRecentHistory(chatId, 10);
        let memoryContext = encryptedHistory.map(row => {
            return `${row.role.toUpperCase()}: ${decryptData(row.encrypted_content)}`;
        }).join('\\n');

        console.log(`[MEMORY] Decrypted context in RAM: \\n${memoryContext}`);

        // Step 3: Simulation (Will be connected to OpenClaw later)
        const simulatedAIResponse = "This is Bellion on Telegram. I have received your encrypted message.";

        // Step 4: Encrypt and save AI's outbound message
        const encryptedOutbound = encryptData(simulatedAIResponse);
        await saveInteraction(chatId, 'assistant', encryptedOutbound);

        // Step 5: Dispatch back to Telegram
        await sendTelegramMessage(chatId, simulatedAIResponse);

    } catch (error) {
        console.error('[ERROR] Processing failed:', error);
    }
}

// Telegram API Dispatcher
async function sendTelegramMessage(chatId, text) {
    if (!TELEGRAM_TOKEN) {
        console.log('[WARN] Telegram Bot Token missing.');
        return;
    }

    try {
        await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            {
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            }
        );
        console.log(`[DELIVERED] Sent Telegram message to ${chatId}`);
    } catch (error) {
        console.error('[ERROR] Failed to send Telegram message:', error.response ? error.response.data : error.message);
    }
}

module.exports = router;
