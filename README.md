# 🌑 Bellion: Zero-Trust Financial Shadow Architecture

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status Active">
  <img src="https://img.shields.io/badge/Platform-OpenClaw-blue?style=for-the-badge" alt="Platform OpenClaw">
  <img src="https://img.shields.io/badge/Interface-Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram">
  <img src="https://img.shields.io/badge/Security-AES--256-red?style=for-the-badge" alt="Security AES-256">
</div>

---

## 📖 The Narrative: Bridging the "Agentic AI" Gap

Everyone on the internet is talking about "Agentic AI," "Multi-Agent Orchestration," and "Autonomous Workflows." Yet, when you look for practical, real-world implementations, you mostly find toy examples or over-engineered chat wrappers. 

**Bellion is an attempt to bridge that gap.** 

It is not just a chatbot; it is a **Headless, Zero-Trust Financial Architecture**. I built Bellion to run completely locally on my machine, utilizing the [OpenClaw](https://github.com/OpenClaw/OpenClaw) agent runtime to proactively manage my finances, audit my spending, and execute tasks autonomously via Telegram—all while ensuring absolute data privacy.

---

## 🧠 The Architecture: How It Works

Bellion is built on a modular, privacy-first stack:

1. **The Brain (OpenClaw):** Runs locally using the `google/gemma-4-31b-it` model. It processes language, makes decisions, and orchestrates tools.
2. **The Interface (Telegram):** A Node.js Zero-Trust Server (`bellion-server`) intercepts messages from my private Telegram bot, encrypts them via AES-256, and routes them to the local LLM.
3. **The Nervous System (MCP & Plugins):** Bellion uses the **Model Context Protocol (MCP)** and specialized OpenClaw plugins to interact with the real world.

---

## ⚡ The "Supercharged" Skills & Plugins

To make Bellion a true "Staff-Level" assistant, I expanded its capabilities beyond basic text generation. Here are the core plugins running in this architecture and how they function:

### 1. Plaid Integration (The Data Ingestion)
* **What it does:** Securely fetches read-only banking and credit card transaction data.
* **The Impact:** Instead of manually downloading CSVs, Bellion automatically pulls my daily spending, categorizes it, and checks it against my burn-rate targets every morning at 7:00 AM via a Cron job.

### 2. Browser Use (The "Hands")
* **What it does:** Allows Bellion to launch a headless Playwright browser, navigate the web, click buttons, and extract data just like a human.
* **The Impact:** When Plaid APIs are delayed, or if I need Bellion to log into a proprietary portal (like checking a live 401k dashboard), it can autonomously navigate the UI and retrieve the exact balance.

### 3. Model Context Protocol (MCP) Power-Ups
By integrating standard MCP servers into OpenClaw, Bellion gained enterprise-grade capabilities:
* **`mcp-sqlite`:** Grants Bellion direct SQL access to the local `tenant_data.sqlite` database. It can instantly run anomaly detection queries across thousands of my past transactions.
* **`mcp-brave-search`:** Gives Bellion live internet access. If I ask, "How did the S&P 500 perform today?", it pulls real-time financial data to contextualize my portfolio.
* **`mcp-sequential-thinking`:** Forces the agent into a "chain-of-thought" loop for complex questions (e.g., "Given inflation trends and my current debt, build a 6-month payoff strategy").

### 4. memU (Infinite Vector Memory)
* **What it does:** Replaces static memory files with a persistent `sqlite-vss` vector database.
* **The Impact:** Bellion remembers everything. If I text, *"How much did I spend on Ubers last month compared to February?"*, it semantically searches its memory vault, retrieves the exact figures, and generates a comparison report instantly.

---

## 👨‍💻 Daily Workflow: How a "Normal Person" Uses Agentic AI

Agentic AI shouldn't require you to sit at a terminal. Here is what my actual, daily workflow looks like:

1. **7:00 AM - The Proactive Briefing:**
   I wake up to a Telegram message. Bellion has already run its Cron job, fetched my Plaid data, and sent me a formatted briefing:
   > *"Good morning. Yesterday you spent $42 on food, breaking your 'Daily Zero' goal. Total debt is down to $X. You are on track to hit your $2,000 Parents Vault target in 14 days."*

2. **2:00 PM - The Analytical Query:**
   I text Bellion from my phone: *"Run an anomaly check on my checking account for the last 30 days."*
   Bellion uses `mcp-sqlite` to query the database and replies:
   > *"I found a recurring $14.99 charge from a vendor you haven't used in 6 months. Would you like me to use the browser tool to navigate to their site and attempt a cancellation?"*

3. **8:00 PM - Long-Term Planning:**
   I ask: *"Remember that I want to save an extra $500 next month for a trip."*
   Bellion uses `memU` to store this in its vector database. The next day, its budget audits will automatically adjust to account for this new constraint.

---

## 🛠️ Setup & Deployment Guide

If you want to run your own Zero-Trust Bellion instance, follow these steps:

### Step 1: Telegram Bot Setup
1. Message `@BotFather` on Telegram and create a new bot. Save the `TELEGRAM_BOT_TOKEN`.
2. Get your personal Telegram Chat ID (you can use `@userinfobot`).
3. Add these to your `.env` file to ensure the server *only* responds to you.

### Step 2: Zero-Trust Server Setup
Navigate to `bellion-server/` and install dependencies:
```bash
cd bellion-server
npm install
```
Create a `.env` file:
```env
ENCRYPTION_MASTER_KEY=your_64_character_hex_key_here
TELEGRAM_BOT_TOKEN=your_bot_token
MY_TELEGRAM_ID=your_chat_id
PORT=3000
```
Run the server: `node server.js`

### Step 3: OpenClaw Configuration
Update your `openclaw.json` to enable the specific plugins and route them to Telegram:
```json
"plugins": {
  "entries": {
    "mcp": { "enabled": true },
    "browser-use": { "enabled": true },
    "memU": { "enabled": true }
  }
}
```

### Step 4: The Background Workers
Check the `scripts/` directory for background watchers:
* `battery_alert.sh`: Pings your Telegram if your MacBook battery drops below 10%, ensuring your agent doesn't die.
* `tx_alert.js`: Monitors local data streams for transactions over $500 and alerts you instantly.

---

## 🛡️ Security & Zero-Trust
* **No Cloud Memory:** All memory is stored locally on your machine.
* **AES-256 Encryption:** Messages received from Telegram are encrypted *before* they are saved to the local SQLite database. Even if the database is compromised, your financial chats remain unreadable without the Master Key.
* **Hard Coded Guardrails:** Bellion is programmed with strict "Read-Only" constraints for financial APIs unless explicitly granted human-in-the-loop authorization.

---
*Built by Nishant Iyer - Sr. Data Analyst bridging the gap between theoretical AI and real-world application.*
