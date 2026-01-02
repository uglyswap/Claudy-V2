/**
 * Synchronize MCP servers from settings.json to .claudy.json
 * This script copies mcpServers from settings.json to the current project in .claudy.json
 * Usage: node sync-mcp.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const claudyDir = path.join(os.homedir(), '.claudy');
const settingsPath = path.join(claudyDir, 'settings.json');
const claudyJsonPath = path.join(claudyDir, '.claudy.json');

// Read settings.json
let settingsData;
try {
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    settingsData = JSON.parse(settingsContent);
} catch (e) {
    console.error('[ERROR] Failed to read settings.json:', e.message);
    process.exit(1);
}

// Read .claudy.json
let claudyData;
try {
    const claudyContent = fs.readFileSync(claudyJsonPath, 'utf8');
    claudyData = JSON.parse(claudyContent);
} catch (e) {
    console.error('[ERROR] Failed to read .claudy.json:', e.message);
    process.exit(1);
}

// Get current working directory as project key
const cwd = process.cwd();
const projectKey = cwd.replace(/\\/g, '/');

// Check if mcpServers exist in settings.json
if (!settingsData.mcpServers || Object.keys(settingsData.mcpServers).length === 0) {
    console.log('[INFO] No MCP servers found in settings.json');
    process.exit(0);
}

// Ensure projects object exists
if (!claudyData.projects) {
    claudyData.projects = {};
}

// Ensure current project exists
if (!claudyData.projects[projectKey]) {
    claudyData.projects[projectKey] = {
        allowedTools: [],
        mcpContextUris: [],
        mcpServers: {},
        enabledMcpjsonServers: [],
        disabledMcpjsonServers: [],
        hasTrustDialogAccepted: false,
        projectOnboardingSeenCount: 0,
        hasClaudeMdExternalIncludesApproved: false,
        hasClaudeMdExternalIncludesWarningShown: false,
        exampleFiles: [],
        reactVulnerabilityCache: {
            detected: false,
            package: null,
            packageName: null,
            version: null,
            packageManager: null
        },
        hasCompletedProjectOnboarding: true
    };
}

// Copy mcpServers from settings.json to .claudy.json
const mcpServers = settingsData.mcpServers;
const serverCount = Object.keys(mcpServers).length;

// Merge mcpServers (preserve existing, add new)
const currentMcpServers = claudyData.projects[projectKey].mcpServers || {};
const mergedServers = { ...currentMcpServers };

for (const [name, config] of Object.entries(mcpServers)) {
    if (!mergedServers[name]) {
        mergedServers[name] = config;
    }
}

claudyData.projects[projectKey].mcpServers = mergedServers;

// Write back to .claudy.json
fs.writeFileSync(claudyJsonPath, JSON.stringify(claudyData, null, 2), 'utf8');

console.log(`[OK] Synced ${serverCount} MCP server(s) from settings.json to .claudy.json`);
console.log(`[INFO] Project: ${projectKey}`);
console.log(`[INFO] Servers: ${Object.keys(mergedServers).join(', ')}`);
