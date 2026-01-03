/**
 * Synchronize MCP servers in .claude.json
 * This script ensures MCP servers are properly configured in the standard Claude Code format
 * Usage: node sync-mcp.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const claudyDir = path.join(os.homedir(), '.claudy');
const settingsPath = path.join(claudyDir, 'settings.json');
const claudeJsonPath = path.join(claudyDir, '.claude.json');

// Read settings.json to get API key
let settingsData;
try {
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    settingsData = JSON.parse(settingsContent);
} catch (e) {
    console.error('[ERROR] Failed to read settings.json:', e.message);
    process.exit(1);
}

// Get API key from settings
const apiKey = settingsData.env?.ANTHROPIC_AUTH_TOKEN;

if (!apiKey || apiKey === 'VOTRE_CLE_API_ZAI_ICI') {
    console.error('[ERROR] No valid API key found in settings.json');
    process.exit(1);
}

// Define MCP servers configuration
const mcpServers = {
    "zai-vision": {
        type: "stdio",
        command: "npx",
        args: ["-y", "@z_ai/mcp-server"],
        env: {
            Z_AI_API_KEY: apiKey,
            Z_AI_MODE: "ZAI"
        }
    },
    "web-search-prime": {
        type: "http",
        url: "https://api.z.ai/api/mcp/web_search_prime/mcp",
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    },
    "web-reader": {
        type: "http",
        url: "https://api.z.ai/api/mcp/web_reader/mcp",
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    },
    "zread": {
        type: "http",
        url: "https://api.z.ai/api/mcp/zread/mcp",
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    }
};

// Read or create .claude.json
let claudeData;
try {
    const claudeContent = fs.readFileSync(claudeJsonPath, 'utf8');
    claudeData = JSON.parse(claudeContent);
} catch (e) {
    // File doesn't exist, create new structure
    claudeData = {};
}

// Ensure mcpServers exists
if (!claudeData.mcpServers) {
    claudeData.mcpServers = {};
}

// Merge mcpServers (preserve existing, update/add new)
const serverCount = Object.keys(mcpServers).length;
const mergedServers = { ...claudeData.mcpServers };

for (const [name, config] of Object.entries(mcpServers)) {
    mergedServers[name] = config;
}

claudeData.mcpServers = mergedServers;

// Write back to .claude.json
fs.writeFileSync(claudeJsonPath, JSON.stringify(claudeData, null, 2), 'utf8');

console.log(`[OK] Synced ${serverCount} MCP server(s) to .claude.json`);
console.log(`[INFO] Servers: ${Object.keys(mergedServers).join(', ')}`);
