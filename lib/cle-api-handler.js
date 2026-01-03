/**
 * Handler for /cle-api command
 * Updates the Z.AI API key in all 5 locations:
 * - settings.json (env.ANTHROPIC_AUTH_TOKEN)
 * - .claudy.json (4 MCP servers)
 * Works WITHOUT the model - pure Node.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function updateApiKey() {
    const settingsPath = path.join(os.homedir(), '.claudy', 'settings.json');
    const claudyJsonPath = path.join(os.homedir(), '.claudy', '.claudy.json');

    console.log('');
    console.log('\x1b[36m========================================\x1b[0m');
    console.log('\x1b[36m   MISE A JOUR CLE API Z.AI            \x1b[0m');
    console.log('\x1b[36m========================================\x1b[0m');
    console.log('');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('\x1b[33mRenseignez votre nouvelle cle API Z.AI:\x1b[0m ', (newKey) => {
            rl.close();

            if (!newKey || !newKey.trim()) {
                console.log('\x1b[31m[ERREUR] La cle ne peut pas etre vide.\x1b[0m');
                return resolve({ type: 'text', value: '' });
            }

            const trimmedKey = newKey.trim();

            // ============================================
            // UPDATE settings.json
            // ============================================
            try {
                const content = fs.readFileSync(settingsPath, 'utf8');
                const settings = JSON.parse(content);
                const oldKey = settings.env && settings.env.ANTHROPIC_AUTH_TOKEN;

                if (!oldKey) {
                    console.log('\x1b[31m[ERREUR] Ancienne cle non trouvee.\x1b[0m');
                    return resolve({ type: 'text', value: '' });
                }

                // Count and replace all occurrences in settings.json
                const escapedOldKey = oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const countSettings = (content.match(new RegExp(escapedOldKey, 'g')) || []).length;
                const newContent = content.split(oldKey).join(trimmedKey);

                fs.writeFileSync(settingsPath, newContent, 'utf8');

                // ============================================
                // UPDATE .claudy.json (4 MCP servers)
                // ============================================
                let countClaudy = 0;
                if (fs.existsSync(claudyJsonPath)) {
                    const claudyContent = fs.readFileSync(claudyJsonPath, 'utf8');
                    countClaudy = (claudyContent.match(new RegExp(escapedOldKey, 'g')) || []).length;
                    const newClaudyContent = claudyContent.split(oldKey).join(trimmedKey);
                    fs.writeFileSync(claudyJsonPath, newClaudyContent, 'utf8');
                }

                // Mask keys for display
                const maskedOld = oldKey.length > 10
                    ? oldKey.substring(0, 6) + '...' + oldKey.substring(oldKey.length - 4)
                    : '***';
                const maskedNew = trimmedKey.length > 10
                    ? trimmedKey.substring(0, 6) + '...' + trimmedKey.substring(trimmedKey.length - 4)
                    : '***';

                const totalCount = countSettings + countClaudy;

                console.log('');
                console.log('\x1b[32m========================================\x1b[0m');
                console.log('\x1b[32m   CLE API Z.AI MISE A JOUR            \x1b[0m');
                console.log('\x1b[32m========================================\x1b[0m');
                console.log('');
                console.log('\x1b[90mAncienne: ' + maskedOld + '\x1b[0m');
                console.log('\x1b[37mNouvelle: ' + maskedNew + '\x1b[0m');
                console.log('');
                console.log('\x1b[32m- settings.json (env.ANTHROPIC_AUTH_TOKEN): OK\x1b[0m');
                console.log('\x1b[32m- .claudy.json (zai-vision): OK\x1b[0m');
                console.log('\x1b[32m- .claudy.json (web-search-prime): OK\x1b[0m');
                console.log('\x1b[32m- .claudy.json (web-reader): OK\x1b[0m');
                console.log('\x1b[32m- .claudy.json (zread): OK\x1b[0m');
                console.log('');
                console.log('\x1b[36m' + totalCount + ' occurrence(s) remplacee(s)\x1b[0m');
                console.log('\x1b[90m  - settings.json: ' + countSettings + '\x1b[0m');
                console.log('\x1b[90m  - .claudy.json: ' + countClaudy + '\x1b[0m');
                console.log('');
                console.log('\x1b[33mRedemarrez Claudy pour appliquer.\x1b[0m');
                console.log('');

            } catch (err) {
                console.log('\x1b[31m[ERREUR] ' + err.message + '\x1b[0m');
            }

            resolve({ type: 'text', value: '' });
        });
    });
}

module.exports = updateApiKey;
