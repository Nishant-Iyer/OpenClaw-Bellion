# Bellion: Private AI Finance Agent

A personal finance agent that runs on my own machine. It sends a daily spending briefing, flags unusual transactions and answers questions about my finances over Telegram, while the language model, transaction history and conversation memory stay local and encrypted.

**[Case study](https://www.konnectingnots.com/projects/bellion.html)**

## Why I built it

Most agentic AI examples are either demos or chat wrappers around a cloud model. Personal finance is a good test of whether an agent is useful in practice, because the data is sensitive and the tasks are routine: checking spending against a budget, spotting unexpected charges and answering ad hoc questions. Bellion follows a few principles common in financial systems: least-privilege, read-only access to accounts; encryption of data at rest; and verified inbound requests.

## Architecture

1. **Agent runtime:** [OpenClaw](https://github.com/OpenClaw/OpenClaw) running Google's Gemma (`google/gemma-4-31b-it`) locally. It interprets requests, plans steps and calls tools.
2. **Messaging gateway:** a Node.js server (`bellion-server`) that receives messages from a private Telegram bot, verifies Telegram's webhook secret and encrypts each message with AES-256-GCM before storing it.
3. **Tools:** standard [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers and OpenClaw plugins give the agent access to data and the web.

## Capabilities

| Tool | What it does |
|---|---|
| Plaid | Pulls read-only bank and card transactions, categorizes them and checks spending against budget targets each morning (scheduled with cron). |
| `mcp-sqlite` | Runs SQL over the local transaction database, for example anomaly checks across past transactions. |
| `memU` | Stores long-term notes and preferences in a local `sqlite-vss` vector database, so later answers can use them. |
| `mcp-brave-search` | Looks up current market and news information when a question needs it. |
| `mcp-sequential-thinking` | Breaks multi-step planning questions into explicit reasoning steps. |
| Browser (Playwright) | Reads balances from sites that don't offer an API. |

## Example day

1. **7:00 AM, scheduled briefing.** Bellion fetches yesterday's transactions and sends a summary: spending against the daily budget, total debt and progress toward savings goals.
2. **Afternoon, ad hoc check.** I ask for an anomaly check on the last 30 days. Bellion queries the database and flags, for example, a recurring subscription I no longer use.
3. **Evening, planning.** I tell it I want to save an extra $500 next month. It stores the goal, and the next day's budget checks take it into account.

## What runs where

| Component | Where it runs |
|---|---|
| Language model (Gemma) and agent runtime (OpenClaw) | Your machine |
| Chat history and memory (SQLite, AES-256-GCM encrypted) | Your machine |
| Bank and card data | Fetched read-only from Plaid's API, stored locally |
| Messaging | Telegram (messages pass through Telegram's servers) |
| Optional tools: web search, Google image model, browser | Call out to the web when used |

Financial records and history stay on your machine and encrypted; the agent still uses a few cloud services to reach you and the web.

## Security

- **Local storage:** memory and transaction history are stored only on your machine.
- **Encryption at rest:** messages from Telegram are encrypted with AES-256-GCM before they are written to the local SQLite database, so the database is unreadable without the master key.
- **Verified webhooks:** the gateway accepts only requests carrying Telegram's secret token, so a message can't be forged by guessing the chat ID.
- **No plaintext logs:** decrypted content is never written to the console or log files.
- **Safe alerts:** `tx_alert.js` passes arguments directly to the CLI without a shell, so transaction names can't inject commands.
- **Read-only account access:** the Plaid integration uses read-only transaction data and cannot move money.

## Setup

### 1. Telegram bot
1. Message [@BotFather](https://t.me/BotFather) on Telegram and create a new bot. Save the `TELEGRAM_BOT_TOKEN`.
2. Get your personal Telegram chat ID (for example with [@userinfobot](https://t.me/userinfobot)).
3. Add both to your `.env` file so the server responds only to you.

### 2. Messaging gateway
Install dependencies:
```bash
cd bellion-server
npm install
```
Create a `.env` file:
```env
ENCRYPTION_MASTER_KEY=your_64_character_hex_key_here
TELEGRAM_BOT_TOKEN=your_bot_token
MY_TELEGRAM_ID=your_chat_id
TELEGRAM_WEBHOOK_SECRET=a_long_random_string
PORT=3000
```
Generate the two secrets with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Register the webhook with the same secret, so Telegram signs every request and the server can reject anything else:
```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d url=https://YOUR_PUBLIC_URL/telegram/webhook \
  -d secret_token=$TELEGRAM_WEBHOOK_SECRET
```
Run the server: `node server.js`

> **Status:** the gateway encrypts and stores every message, but its reply is still a placeholder. The live agent talks to Telegram directly through OpenClaw's channel binding (`openclaw.example.json`). Routing the agent through this encrypted gateway is the next step.

### 3. OpenClaw configuration
Enable the plugins in your `openclaw.json`:
```json
"plugins": {
  "entries": {
    "mcp": { "enabled": true },
    "browser-use": { "enabled": true },
    "memU": { "enabled": true }
  }
}
```

### 4. Background scripts
The `scripts/` directory has two watchers:
- `battery_alert.sh` sends a Telegram alert if the host laptop's battery drops below 10%, so the agent doesn't go offline unnoticed.
- `tx_alert.js` alerts on transactions over $500.

## License

MIT. See [LICENSE](LICENSE).

---

Built by [Nishant Iyer](https://www.konnectingnots.com), Senior Data Analyst at Capital One.
