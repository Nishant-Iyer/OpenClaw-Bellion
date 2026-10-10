const crypto = require('crypto');

// The key must be exactly 32 bytes (64 hex characters). Fail fast with a clear message
// instead of a cryptic error on the first message.
const KEY_HEX = process.env.ENCRYPTION_MASTER_KEY || '';
if (!/^[0-9a-fA-F]{64}$/.test(KEY_HEX)) {
    throw new Error('ENCRYPTION_MASTER_KEY must be 64 hex characters (32 bytes). Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}
const ENCRYPTION_KEY = Buffer.from(KEY_HEX, 'hex');
const ALGORITHM = 'aes-256-gcm';

function encryptData(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

function decryptData(encryptedPayload) {
    if (!encryptedPayload) return null;
    const parts = encryptedPayload.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

module.exports = { encryptData, decryptData };