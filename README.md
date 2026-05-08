# 🌑 Bellion: Financial Shadow Architecture

## 🚀 CORE OPERATIONS

### Starting the Bot
To start the WhatsApp bridge and the AI brain, run:
```bash
openclaw gateway start
```

### Daily Briefing (Automation)
*   **Trigger:** 7:00 AM CST Daily.
*   **Target:** Your personal WhatsApp chat (Igris).
*   **Logic:** Pulls live Plaid data, auto-updates 401k/HSA (bi-weekly), and audits spending.
*   **Config File:** `~/.openclaw/cron/jobs.json`

## 📂 DIRECTORY MAP

| Path | Purpose |
| :--- | :--- |
| `~/.openclaw/openclaw.json` | Global system configuration & permissions. |
| `~/.openclaw/workspace-finance/` | The active engine for Bellion. Contains `.env` & `MEMORY.md`. |
| `~/.openclaw/bellion-server/` | The Zero-Trust wrapper (AES-256 encrypted memory). |
| `~/.openclaw/agents/` | Persona definitions (Bellion, Igris, etc.). |

## 🛡️ SECURITY & ZERO-TRUST
*   **Master Key:** Stored in `~/bellion-server/.env`. If lost, encrypted chat history cannot be recovered.
*   **Hard Rules:** Bellion is programmed to enforce a $0 delivery budget until debt-free.
*   **Memory:** `MEMORY.md` is the only persistent long-term storage for financial targets.

## 📈 MAINTENANCE
*   **Plaid Tokens:** If a bank connection breaks, run the Bellion setup UI on port 3000/8000.
*   **Adding Friends:** Add their numbers to `openclaw.json` (for standard use) or the Zero-Trust database (for headless use).
