const crypto = require('crypto');
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { encryptData, decryptData } = require('../middleware/encryption');
const { saveInteraction, getRecentHistory } = require('../services/db');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MY_TELEGRAM_ID = process.env.MY_TELEGRAM_ID;
// Set the same value as `secret_token` when registering the webhook (setWebhook).
// Telegram then sends it in the X-Telegram-Bot-Api-Secret-Token header on every update,
// which proves the request really came from Telegram. A chat ID alone is not a secret.
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
    throw new Error('TELEGRAM_WEBHOOK_SECRET is required. Use a long random string and pass it as secret_token to setWebhook.');
}

function isFromTelegram(req) {
    const got = Buffer.from(req.get('X-Telegram-Bot-Api-Secret-Token') || '');
    const want = Buffer.from(WEBHOOK_SECRET);
    return got.length === want.length && crypto.timingSafeEqual(got, want);
}

// Telegram Webhook Endpoint
router.post('/webhook', async (req, res) => {
    if (!isFromTelegram(req)) {
        console.warn('[WARN] Rejected webhook call without a valid secret token');
        return res.sendStatus(401);
    }
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

// Core Processing Pipeline
async function handleIncomingMessage(chatId, rawText) {
    try {
        // Step 1: Encrypt and save user's inbound message immediately
        const encryptedInbound = encryptData(rawText);
        await saveInteraction(chatId, 'user', encryptedInbound);

        // Step 2: Retrieve and decrypt working memory (RAM Only)
        const encryptedHistory = await getRecentHistory(chatId, 10);
        let memoryContext = encryptedHistory.map(row => {
            return `${row.role.toUpperCase()}: ${decryptData(row.encrypted_content)}`;
        }).join('\n');

        // Never log decrypted content: logs are plaintext files outside the encrypted store.
        console.log(`[MEMORY] Loaded ${encryptedHistory.length} messages into working memory`);

        // Step 3: Placeholder reply. The live agent currently talks to Telegram directly
        // through OpenClaw's own channel binding (see openclaw.example.json); routing it
        // through this encrypted gateway is the next step.
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
