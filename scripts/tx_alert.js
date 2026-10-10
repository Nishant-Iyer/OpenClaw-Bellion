const fs = require('fs');
const { execFileSync } = require('child_process');
const path = '/YOUR/PATH/TO/workspace/live_data.json';

try {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  const today = new Date().toISOString().split('T')[0];
  let alerts = [];

  for (const [bank, info] of Object.entries(data)) {
    if (info.transactions) {
      info.transactions.forEach(tx => {
        // If transaction is from today and amount is over $500 (or less than -$500 for outflows)
        if (tx.date === today && Math.abs(tx.amount) >= 500) {
          alerts.push(`- $${Math.abs(tx.amount)} on ${bank} (${tx.name})`);
        }
      });
    }
  }

  if (alerts.length > 0) {
    const message = `⚠️ *Large Transaction Alert*\nSir, I have detected anomalous activity today:\n${alerts.join('\n')}\n\nPlease review your accounts.`;
    // Pass arguments directly (no shell), so a merchant name containing quotes or
    // shell characters can't break out of the command.
    execFileSync('/opt/homebrew/bin/openclaw', [
      'message', 'send', '--channel', 'telegram', '--target', 'YOUR_TELEGRAM_ID', '--message', message
    ]);
  }
} catch (e) {
  // Silently exit if file is missing or unreadable
}
