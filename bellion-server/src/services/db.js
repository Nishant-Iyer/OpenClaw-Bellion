const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../tenant_data.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize Multi-Tenant Schema
db.serialize(() => {
    // Tenants Table (User mapping + encrypted long-term memory)
    db.run(`CREATE TABLE IF NOT EXISTS tenants (
        whatsapp_id TEXT PRIMARY KEY,
        encrypted_plaid_tokens TEXT,
        encrypted_core_memory TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Chat History Table (Short-term working memory)
    db.run(`CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        whatsapp_id TEXT NOT NULL,
        role TEXT NOT NULL,
        encrypted_content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (whatsapp_id) REFERENCES tenants(whatsapp_id)
    )`);
});

// Database Helper Functions
const saveInteraction = (whatsappId, role, encryptedText) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO chat_history (whatsapp_id, role, encrypted_content) VALUES (?, ?, ?)",
            [whatsappId, role, encryptedText], 
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

const getRecentHistory = (whatsappId, limit = 10) => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT role, encrypted_content FROM chat_history WHERE whatsapp_id = ? ORDER BY timestamp DESC LIMIT ?",
            [whatsappId, limit],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows.reverse()); // Chronological order
            }
        );
    });
};

const getTenant = (whatsappId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM tenants WHERE whatsapp_id = ?", [whatsappId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

module.exports = { db, saveInteraction, getRecentHistory, getTenant };