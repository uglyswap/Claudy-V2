/**
 * Patch Claude Code to create cli-claudy.js with CLAUDY branding
 * IMPORTANT: Does NOT modify cli.js - creates a separate cli-claudy.js file
 * This allows 'claude' command to remain unaffected while 'claudy' uses patched version
 * 
 * Usage:
 *   node patch-claudy-logo.js                    # Uses npm global path (legacy)
 *   node patch-claudy-logo.js ~/.claudy/lib      # Uses custom path (isolated install)
 * 
 * Features:
 * - CLAUDY ASCII logo with gradient colors
 * - AKHITHINK detection for rainbow animation
 * - All "Claude Code" text replaced with "Claudy"
 * - All config paths changed from ~/.claude/ to ~/.claudy/
 * - /cle-api command injected as native command (no model needed)
 * - Force compact mode for home screen (large logo fits better)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Check if custom path is provided as argument
const customLibPath = process.argv[2];

let cliPath = null;

if (customLibPath) {
    // ═══════════════════════════════════════════════════════════════════════════
    // ISOLATED INSTALLATION MODE: Use custom path (~/.claudy/lib/)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Expand ~ to home directory if needed
    let libPath = customLibPath;
    if (libPath.startsWith('~')) {
        libPath = path.join(os.homedir(), libPath.slice(1));
    }
    
    const customCliPath = path.join(libPath, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js');
    
    if (fs.existsSync(customCliPath)) {
        cliPath = customCliPath;
        console.log('[PATCH] Using isolated installation path:', libPath);
    } else {
        console.log('[WARN] cli.js not found at custom path:', customCliPath);
        process.exit(0);
    }
} else {
    // ═══════════════════════════════════════════════════════════════════════════
    // LEGACY MODE: Search in npm global paths
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Get npm global path
    const npmPrefix = process.env.npm_config_prefix ||
        (process.platform === 'win32'
            ? path.join(process.env.APPDATA, 'npm')
            : '/usr/local');

    // Try multiple possible locations for cli.js
    const possiblePaths = [
        path.join(npmPrefix, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'),
        path.join(npmPrefix, 'lib', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            cliPath = p;
            break;
        }
    }

    if (!cliPath) {
        console.log('[WARN] cli.js not found at expected locations');
        possiblePaths.forEach(p => console.log('  Tried:', p));
        process.exit(0);
    }
    
    console.log('[PATCH] Using npm global installation');
}

// Define path for the patched copy
const cliDir = path.dirname(cliPath);
const claudyCliPath = path.join(cliDir, 'cli-claudy.js');

console.log('[PATCH] Creating patched copy:', claudyCliPath);
console.log('[PATCH] Original cli.js remains untouched:', cliPath);

// Read original content
let content = fs.readFileSync(cliPath, 'utf8');
let patchCount = 0;

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 1: Replace "Claude Code v" with "Claudy v"
// ═══════════════════════════════════════════════════════════════════════════
if (content.includes('Claude Code v')) {
    content = content.split('Claude Code v').join('Claudy v');
    patchCount++;
    console.log('  [OK] Replaced "Claude Code v" → "Claudy v"');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 2: Replace "Claude Code" in quotes with "Claudy"
// ═══════════════════════════════════════════════════════════════════════════
if (content.includes('"Claude Code"')) {
    content = content.split('"Claude Code"').join('"Claudy"');
    patchCount++;
    console.log('  [OK] Replaced "Claude Code" → "Claudy"');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 3: Replace the logo with CLAUDY ASCII art
// ═══════════════════════════════════════════════════════════════════════════

// CLAUDY ASCII Logo lines with gradient colors (Yellow -> Orange -> Rose -> Magenta)
const logoLines = [
    { text: ' ██████╗██╗      █████╗ ██╗   ██╗██████╗ ██╗   ██╗', color: '#ffff00' },
    { text: '██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗╚██╗ ██╔╝', color: '#ffaf00' },
    { text: '██║     ██║     ███████║██║   ██║██║  ██║ ╚████╔╝ ', color: '#ff8700' },
    { text: '██║     ██║     ██╔══██║██║   ██║██║  ██║  ╚██╔╝  ', color: '#ff5faf' },
    { text: '╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝   ██║   ', color: '#ff5fd7' },
    { text: ' ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝    ╚═╝   ', color: '#ff87ff' }
];

const signatureLine = '              ▓▒░ CLAUDY CLI ░▒▓';
const tagline = '             ⚡ Agentic Coding ⚡';

// Original logo structure pattern - version u2
const oldLogoPattern1 = `u2.createElement(C,null,u2.createElement(C,{color:"text"}," *"),u2.createElement(C,{color:"ice_blue"}," ▐"),u2.createElement(C,{color:"ice_blue",backgroundColor:"clawd_background"},"▛███▜"),u2.createElement(C,{color:"ice_blue"},"▌"),u2.createElement(C,{color:"text"}," *")),u2.createElement(C,null,u2.createElement(C,{color:"text"},"*"),u2.createElement(C,{color:"ice_blue"}," ▝▜"),u2.createElement(C,{color:"ice_blue",backgroundColor:"clawd_background"},"█████"),u2.createElement(C,{color:"ice_blue"},"▛▘"),u2.createElement(C,{color:"text"}," *")),u2.createElement(C,null,u2.createElement(C,{color:"text"}," * "),u2.createElement(C,{color:"ice_blue"}," ▘▘ ▝▝","  "),u2.createElement(C,{color:"text"},"*"))`;

const newLogoStructure1 = [
    ...logoLines.map(line => `u2.createElement(C,{color:"${line.color}"},"${line.text}")`),
    `u2.createElement(C,{color:"#00ffff"},"${signatureLine}")`,
    `u2.createElement(C,{color:"#ffff00"},"${tagline}")`
].join(',');

if (content.includes(oldLogoPattern1)) {
    content = content.replace(oldLogoPattern1, newLogoStructure1);
    patchCount++;
    console.log('  [OK] Replaced logo pattern 1 (u2.createElement) with Claudy gradient');
}

// Original logo structure pattern - version $B
const oldLogoPattern2 = `$B.createElement(C,null,$B.createElement(C,{color:"text"}," *"),$B.createElement(C,{color:"ice_blue"}," ▐"),$B.createElement(C,{color:"ice_blue",backgroundColor:"clawd_background"},"▛███▜"),$B.createElement(C,{color:"ice_blue"},"▌"),$B.createElement(C,{color:"text"}," *")),$B.createElement(C,null,$B.createElement(C,{color:"text"},"*"),$B.createElement(C,{color:"ice_blue"}," ▝▜"),$B.createElement(C,{color:"ice_blue",backgroundColor:"clawd_background"},"█████"),$B.createElement(C,{color:"ice_blue"},"▛▘"),$B.createElement(C,{color:"text"}," *")),$B.createElement(C,null,$B.createElement(C,{color:"text"}," * "),$B.createElement(C,{color:"ice_blue"}," ▘▘ ▝▝","  "),$B.createElement(C,{color:"text"},"*"))`;

const newLogoStructure2 = [
    ...logoLines.map(line => `$B.createElement(C,{color:"${line.color}"},"${line.text}")`),
    `$B.createElement(C,{color:"#00ffff"},"${signatureLine}")`,
    `$B.createElement(C,{color:"#ffff00"},"${tagline}")`
].join(',');

if (content.includes(oldLogoPattern2)) {
    content = content.replace(oldLogoPattern2, newLogoStructure2);
    patchCount++;
    console.log('  [OK] Replaced logo pattern 2 ($B.createElement) with Claudy gradient');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 4: Add AKHITHINK detection to ultrathink function
// ═══════════════════════════════════════════════════════════════════════════

const ultrathinkPatterns = [
    {
        old: 'Q==="ultrathink"||Q==="think ultra hard"||Q==="think ultrahard"',
        new: 'Q==="ultrathink"||Q==="think ultra hard"||Q==="think ultrahard"||Q==="akhithink"'
    },
    {
        old: 'Q==="think ultra hard"||Q==="think ultrahard"||Q==="ultrathink"',
        new: 'Q==="think ultra hard"||Q==="think ultrahard"||Q==="ultrathink"||Q==="akhithink"'
    }
];

for (const pattern of ultrathinkPatterns) {
    if (content.includes(pattern.old) && !content.includes('"akhithink"')) {
        content = content.replace(pattern.old, pattern.new);
        patchCount++;
        console.log('  [OK] Added "akhithink" to ultrathink detection (rainbow animation enabled)');
        break;
    }
}

if (content.includes('"akhithink"')) {
    console.log('  [INFO] AKHITHINK string detection already present');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 5: Replace ultrathink REGEX patterns to also match "akhithink"
// ═══════════════════════════════════════════════════════════════════════════

const regexPattern1Old = '/\\bultrathink\\b/i';
const regexPattern1New = '/\\b(ultrathink|akhithink)\\b/i';

if (content.includes(regexPattern1Old) && !content.includes('akhithink)\\b/i')) {
    content = content.split(regexPattern1Old).join(regexPattern1New);
    patchCount++;
    console.log('  [OK] Patched regex /\\bultrathink\\b/i → includes akhithink');
}

const regexPattern2Old = '/\\bultrathink\\b/gi';
const regexPattern2New = '/\\b(ultrathink|akhithink)\\b/gi';

if (content.includes(regexPattern2Old) && !content.includes('akhithink)\\b/gi')) {
    content = content.split(regexPattern2Old).join(regexPattern2New);
    patchCount++;
    console.log('  [OK] Patched regex /\\bultrathink\\b/gi → includes akhithink');
}

if (content.includes('akhithink)\\b/')) {
    console.log('  [INFO] AKHITHINK regex patterns already present');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 6: Replace .claude/skills with .claudy/skills for user skills
// This ensures Claudy loads skills from ~/.claudy/skills/ instead of ~/.claude/skills/
// ═══════════════════════════════════════════════════════════════════════════

const skillsPathOld = '.claude/skills';
const skillsPathNew = '.claudy/skills';

const skillsOccurrences = (content.match(/\.claude\/skills/g) || []).length;
if (skillsOccurrences > 0) {
    content = content.split(skillsPathOld).join(skillsPathNew);
    patchCount++;
    console.log(`  [OK] Replaced ${skillsOccurrences}x ".claude/skills" → ".claudy/skills"`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 7: PRECISE REPLACEMENT - Replace ONLY file paths
// This prevents breaking logos and other UI elements
// Previous global replacement broke Claude/Claudy branding
// ═══════════════════════════════════════════════════════════════════════════

let totalReplaced = 0;

// Replace ONLY specific file path patterns (NOT global search!)
const pathReplacements = [
  ['.claude.json', '.claudy.json'],
  ['.claude/settings', '.claudy/settings'],
  ['.claude/settings.local', '.claudy/settings.local'],
  ['.claude/skills', '.claudy/skills'],
  ['.claude,CLAUDE', '.claudy,CLAUDE'],
  ['.claude,rules', '.claudy,rules']
];

for (const [from, to] of pathReplacements) {
  // Use split/join for simple literal replacement (no regex needed)
  const occurrences = content.split(from).length - 1;
  if (occurrences > 0) {
    content = content.split(from).join(to);
    totalReplaced += occurrences;
    console.log(`  [OK] Replaced ${occurrences}x "${from}" → "${to}"`);
  }
}

if (totalReplaced > 0) {
    patchCount++;
    console.log(`  [SUMMARY] Total path replacements: ${totalReplaced}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 8: Inject /cle-api and /cle as native slash commands
// These commands work WITHOUT the model - pure Node.js
//
// STRATEGY: Find the commands array MW9=W0(()=>[...,g89,m89,...])
// where g89=clear, m89=compact. Inject inline command objects between them.
// Pattern "g89,m89" is UNIQUE and safe - only exists in commands array
// ═══════════════════════════════════════════════════════════════════════════

// Inline command objects using dynamic import() for ESM compatibility
// NO popup, NO interactive prompt - just pass the key as argument
// Usage: /cle-api <nouvelle_cle>
const cleApiInline = '{type:"local",name:"cle-api",description:"Changer la cle API Z.AI",isEnabled:()=>!0,isHidden:!1,supportsNonInteractive:!0,async call(input){try{const f=await import("fs"),p=await import("path"),o=await import("os");let K=String(input||"").trim();if(!K){return{type:"text",value:"\\n========================================\\n   CHANGER LA CLE API Z.AI\\n========================================\\n\\nUsage: /cle-api <nouvelle_cle>\\n\\nExemple:\\n  /cle-api abc123def456.XyzToken\\n\\nLa cle sera mise a jour dans:\\n- ANTHROPIC_AUTH_TOKEN\\n- Z_AI_API_KEY (vision)\\n- Authorization headers (web-search, web-reader)\\n"}}const sp=p.join(o.homedir(),".claudy","settings.json");const c=f.readFileSync(sp,"utf8");const s=JSON.parse(c);const ok=s.env&&s.env.ANTHROPIC_AUTH_TOKEN;if(!ok)throw new Error("Ancienne cle non trouvee");const cnt=c.split(ok).length-1;const nc=c.split(ok).join(K);f.writeFileSync(sp,nc,"utf8");const m1=ok.length>10?ok.substring(0,6)+"..."+ok.slice(-4):"***";const m2=K.length>10?K.substring(0,6)+"..."+K.slice(-4):"***";return{type:"text",value:"\\n========================================\\n   CLE API Z.AI MISE A JOUR\\n========================================\\n\\nAncienne: "+m1+"\\nNouvelle: "+m2+"\\n\\n- ANTHROPIC_AUTH_TOKEN: OK\\n- Z_AI_API_KEY (vision): OK\\n- Authorization web-search-prime: OK\\n- Authorization web-reader: OK\\n\\n"+cnt+" occurrence(s) remplacee(s)\\n"}}catch(e){return{type:"text",value:"[ERREUR] "+e.message}}},userFacingName(){return"cle-api"}}';

const cleInline = '{type:"local",name:"cle",description:"Alias pour /cle-api",isEnabled:()=>!0,isHidden:!0,supportsNonInteractive:!0,async call(input){try{const f=await import("fs"),p=await import("path"),o=await import("os");let K=String(input||"").trim();if(!K){return{type:"text",value:"Usage: /cle <nouvelle_cle>"}}const sp=p.join(o.homedir(),".claudy","settings.json");const c=f.readFileSync(sp,"utf8");const s=JSON.parse(c);const ok=s.env&&s.env.ANTHROPIC_AUTH_TOKEN;if(!ok)throw new Error("Ancienne cle non trouvee");const nc=c.split(ok).join(K);f.writeFileSync(sp,nc,"utf8");return{type:"text",value:"[OK] Cle API mise a jour."}}catch(e){return{type:"text",value:"[ERREUR] "+e.message}}},userFacingName(){return"cle"}}';

let commandInjected = false;

// First check if already injected
if (content.includes('name:"cle-api"')) {
    console.log('  [INFO] /cle-api command already injected');
    commandInjected = true;
} else {
    // STRATEGY 1: Find g89,m89 pattern (clear,compact in commands array)
    // This is the safest - only exists in the commands array, never in assignments
    const arrayPattern = 'g89,m89';
    if (content.includes(arrayPattern)) {
        const injection = 'g89,' + cleApiInline + ',' + cleInline + ',m89';
        content = content.replace(arrayPattern, injection);
        commandInjected = true;
        patchCount++;
        console.log('  [OK] Injected /cle-api and /cle into commands array (g89,m89 pattern)');
    }

    // STRATEGY 2: Fallback - find any command variable pairs in array
    if (!commandInjected) {
        // Look for patterns like "X89,Y89" or "a89,b89" (variable names in array)
        const varArrayMatch = content.match(/([a-zA-Z]\d{2}),([a-zA-Z]\d{2}),([a-zA-Z]\d{2})/);
        if (varArrayMatch) {
            const [fullMatch, v1, v2, v3] = varArrayMatch;
            // Inject between first and second variable
            const injection = v1 + ',' + cleApiInline + ',' + cleInline + ',' + v2 + ',' + v3;
            content = content.replace(fullMatch, injection);
            commandInjected = true;
            patchCount++;
            console.log(`  [OK] Injected /cle-api and /cle into commands array (${v1},${v2} pattern)`);
        }
    }
}

if (!commandInjected) {
    console.log('  [WARN] No commands array pattern found');
    console.log('  [INFO] /cle-api will work via skill instead (no autocomplete)');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 9: Force compact mode for home screen (Claudy logo is too wide for horizontal)
// The function pr2(A) returns "horizontal" if terminal >= 70 columns, "compact" otherwise
// For Claudy, we always use compact to avoid breaking the large ASCII logo
// ═══════════════════════════════════════════════════════════════════════════

const homeLayoutOld = 'function pr2(A){if(A>=70)return"horizontal";return"compact"}';
const homeLayoutNew = 'function pr2(A){return"compact"}';

if (content.includes(homeLayoutOld)) {
    content = content.replace(homeLayoutOld, homeLayoutNew);
    patchCount++;
    console.log('  [OK] Forced compact mode for home screen (Claudy logo fits better)');
} else {
    console.log('  [WARN] Home layout function pr2 not found - may use different pattern');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 10: Replace "Welcome back" with "Bienvenue" for Claudy branding
// ═══════════════════════════════════════════════════════════════════════════

if (content.includes('Welcome back')) {
    content = content.split('Welcome back').join('Bienvenue');
    patchCount++;
    console.log('  [OK] Replaced "Welcome back" → "Bienvenue"');
}
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// PATCH 11: Skip bypass permissions dialog completely
// Two-part fix:
//   11a. Modify condition to never show the dialog (always false)
//   11b. Modify useEffect to set config flag anyway (for consistency)
// ═══════════════════════════════════════════════════════════════════════════

// 11a: Make the condition always false so dialog never renders
const bypassConditionOld = '(A==="bypassPermissions"||Q)&&!b1().bypassPermissionsModeAccepted)await';
const bypassConditionNew = '!1)await';

if (content.includes(bypassConditionOld)) {
    content = content.replace(bypassConditionOld, bypassConditionNew);
    patchCount++;
    console.log('  [OK] Bypass dialog condition disabled (never shows)');
} else {
    console.log('  [WARN] Bypass condition pattern not found');
}

// 11b: Also modify the useEffect to auto-accept (sets config flag for future runs)
const bypassUseEffectOld = 'SD.default.useEffect(()=>{n("tengu_bypass_permissions_mode_dialog_shown",{})},[])';
const bypassUseEffectNew = 'SD.default.useEffect(()=>{n("tengu_bypass_permissions_mode_dialog_accept",{}),d0((Z)=>{if(Z.bypassPermissionsModeAccepted===!0)return Z;return{...Z,bypassPermissionsModeAccepted:!0}}),A()},[])';

if (content.includes(bypassUseEffectOld)) {
    content = content.replace(bypassUseEffectOld, bypassUseEffectNew);
    patchCount++;
    console.log('  [OK] Bypass useEffect modified (sets config flag)');
}

// PATCH 12: Replace onboarding "Welcome to Claude Code" with Claudy branding
// This changes the welcome screen title during first-time setup
// ═══════════════════════════════════════════════════════════════════════════

if (content.includes('"Welcome to Claude Code"')) {
    content = content.split('"Welcome to Claude Code"').join('"Bienvenue sur Claudy v2.0.74"');
    patchCount++;
    console.log('  [OK] Replaced onboarding "Welcome to Claude Code" → "Bienvenue sur Claudy v2.0.74"');
}

// Also replace any remaining "Welcome to Claude Code" patterns
if (content.includes('Welcome to Claude Code')) {
    content = content.split('Welcome to Claude Code').join('Bienvenue sur Claudy v2.0.74');
    patchCount++;
    console.log('  [OK] Replaced remaining "Welcome to Claude Code" → "Bienvenue sur Claudy v2.0.74"');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 12b: Remove the ASCII border/frame around the logo
// This removes the box-drawing characters border from the welcome screen
// ═══════════════════════════════════════════════════════════════════════════

// The borderStyle:"round" creates the ASCII border. We replace it with void (no border)
if (content.includes('borderStyle:"round",borderColor:"success"')) {
    content = content.split('borderStyle:"round",borderColor:"success"').join('borderStyle:void');
    patchCount++;
    console.log('  [OK] Removed borderStyle:"round" from success dialog');
}

if (content.includes('borderStyle:"round",borderColor:"warning"')) {
    content = content.split('borderStyle:"round",borderColor:"warning"').join('borderStyle:void');
    patchCount++;
    console.log('  [OK] Removed borderStyle:"round" from warning dialog');
}

if (content.includes('borderStyle:"round",borderColor:"error"')) {
    content = content.split('borderStyle:"round",borderColor:"error"').join('borderStyle:void');
    patchCount++;
    console.log('  [OK] Removed borderStyle:"round" from error dialog');
}

if (content.includes('borderStyle:"round",borderColor:"permission"')) {
    content = content.split('borderStyle:"round",borderColor:"permission"').join('borderStyle:void');
    patchCount++;
    console.log('  [OK] Removed borderStyle:"round" from permission dialog');
}

if (content.includes('borderStyle:"round",borderColor:"chromeYellow"')) {
    content = content.split('borderStyle:"round",borderColor:"chromeYellow"').join('borderStyle:void');
    patchCount++;
    console.log('  [OK] Removed borderStyle:"round" from chrome dialog');
}

// Also remove any remaining borderStyle:"round" without specific color
if (content.includes('borderStyle:"round"')) {
    content = content.split('borderStyle:"round"').join('borderStyle:void');
    patchCount++;
    console.log('  [OK] Removed remaining borderStyle:"round" borders');
}

// Remove ALL borderStyle patterns - double, single, thick, etc.
const borderStyles = ['double', 'single', 'thick', 'bold'];
for (const style of borderStyles) {
    const borderPattern = `borderStyle:"${style}"`;
    if (content.includes(borderPattern)) {
        content = content.split(borderPattern).join('borderStyle:void');
        patchCount++;
        console.log(`  [OK] Removed borderStyle:"${style}" borders`);
    }
}

// Remove any borderColor patterns to ensure borders don't show up
const borderColors = ['success', 'warning', 'error', 'permission', 'chromeYellow', 'ice_blue', 'text'];
for (const color of borderColors) {
    const colorPattern = `borderColor:"${color}"`;
    if (content.includes(colorPattern)) {
        content = content.split(colorPattern).join('');
        patchCount++;
        console.log(`  [OK] Removed borderColor:"${color}"`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 13: Replace U17 alternative logo function (u2 version)
// This function displays a simplified logo for certain terminals
// We replace the entire function body to show Claudy logo instead
// ═══════════════════════════════════════════════════════════════════════════

// Marker to find the U17 function (unique enough to identify it)
const u17Marker = 'function U17(){return u2.createElement(T,{flexDirection:"column",alignItems:"center"},u2.createElement(C,null,u2.createElement(C,{color:"text"}," * "),u2.createElement(C,{color:"ice_blue"}';
if (content.includes(u17Marker)) {
    // Find the full function by locating start and counting braces
    const startIdx = content.indexOf(u17Marker);
    let depth = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < content.length && i < startIdx + 2000; i++) {
        if (content[i] === '{') depth++;
        if (content[i] === '}') {
            depth--;
            if (depth === 0) {
                endIdx = i + 1;
                break;
            }
        }
    }
    const oldU17 = content.substring(startIdx, endIdx);

    // New U17 function with Claudy logo
    const u17New = 'function U17(){return u2.createElement(T,{flexDirection:"column",alignItems:"center"},' +
        logoLines.map(line => 'u2.createElement(C,{color:"' + line.color + '"},"' + line.text + '")').join(',') + ',' +
        'u2.createElement(C,{color:"#00ffff"},"' + signatureLine + '"),' +
        'u2.createElement(C,{color:"#ffff00"},"' + tagline + '"))}';

    content = content.replace(oldU17, u17New);
    patchCount++;
    console.log('  [OK] Replaced U17 alternative logo function with Claudy gradient');
} else {
    console.log('  [INFO] U17 alternative logo function not found (may be already patched)');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 14: Replace L17 alternative logo function ($B version)
// This function handles Apple_Terminal special case + default logo
// We replace entire function to always show Claudy logo
// ═══════════════════════════════════════════════════════════════════════════

const l17Marker = 'function L17(){if(DQ.terminal==="Apple_Terminal")return $B.createElement(T,{flexDirection:"column",alignItems:"center"},$B.createElement(C,null,$B.createElement(C,{color:"text"}," * "),$B.createElement(C,{color:"ice_blue"}';
if (content.includes(l17Marker)) {
    // Find the full function by locating start and counting braces
    const startIdx = content.indexOf(l17Marker);
    let depth = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < content.length && i < startIdx + 2000; i++) {
        if (content[i] === '{') depth++;
        if (content[i] === '}') {
            depth--;
            if (depth === 0) {
                endIdx = i + 1;
                break;
            }
        }
    }
    const oldL17 = content.substring(startIdx, endIdx);

    // New L17 function - always returns Claudy logo (no Apple_Terminal special case needed)
    const l17New = 'function L17(){return $B.createElement(T,{flexDirection:"column",alignItems:"center"},' +
        logoLines.map(line => '$B.createElement(C,{color:"' + line.color + '"},"' + line.text + '")').join(',') + ',' +
        '$B.createElement(C,{color:"#00ffff"},"' + signatureLine + '"),' +
        '$B.createElement(C,{color:"#ffff00"},"' + tagline + '"))}';

    content = content.replace(oldL17, l17New);
    patchCount++;
    console.log('  [OK] Replaced L17 alternative logo function with Claudy gradient');
} else {
    console.log('  [INFO] L17 alternative logo function not found (may be already patched)');
}


// ═══════════════════════════════════════════════════════════════════════════
// PATCH 15: Remove "Bienvenue!" text from chat screen header
// This removes the "Welcome!" text that appears above the logo in chat mode
// ═══════════════════════════════════════════════════════════════════════════

// Remove French "Bienvenue!" with exclamation
const bienvenuePattern1 = 'children:[p?"":U?"":U,';
if (content.includes('children:["Bienvenue!",')) {
    content = content.split('children:["Bienvenue!",').join('children:["",');
    patchCount++;
    console.log('  [OK] Removed "Bienvenue!" from chat header (French)');
}

// Also try pattern with just "Bienvenue" without exclamation
if (content.includes('children:["Bienvenue"')) {
    content = content.split('children:["Bienvenue"').join('children[""');
    patchCount++;
    console.log('  [OK] Removed "Bienvenue" from chat header (variant)');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 16: Remove "Claude Code" title from chat screen border
// This removes the "Claude Code" title that appears in the top border frame
// ═══════════════════════════════════════════════════════════════════════════

// The border title pattern - typically something like: title:"Claude Code"
if (content.includes('title:"Claude Code"')) {
    content = content.split('title:"Claude Code"').join('title:"Claudy"');
    patchCount++;
    console.log('  [OK] Replaced border title "Claude Code" → "Claudy"');
}

// Also try with single quotes
if (content.includes("title:'Claude Code'")) {
    content = content.split("title:'Claude Code'").join("title:'Claudy'");
    patchCount++;
    console.log('  [OK] Replaced border title "Claude Code" → "Claudy" (single quotes)');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 17: Remove ASCII border title completely
// This removes the title in box-drawing borders like "╭─ Claude Code ──╮"
// We replace it with empty string or just spaces to show only the logo
// ═══════════════════════════════════════════════════════════════════════════

// Replace "Claude Code" in border titles with empty string (removes title)
if (content.includes('"Claude Code"')) {
    content = content.split('"Claude Code"').join('""');
    patchCount++;
    console.log('  [OK] Removed "Claude Code" from ASCII border titles');
}

// Also replace "Claudy" in title fields with empty to completely remove border title
// Look for title:"Claudy" patterns in border/box components
if (content.includes('title:"Claudy"')) {
    content = content.split('title:"Claudy"').join('title:""');
    patchCount++;
    console.log('  [OK] Removed "Claudy" from border titles (empty title)');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 18: Replace any remaining "Claude" with "Claudy" in specific UI contexts
// This catches any missed instances in headers, titles, and borders
// ═══════════════════════════════════════════════════════════════════════════

// Look for "Claude" in header/title patterns but exclude "claude" command refs
const headerPatterns = [
    'label:"Claude"',          // Button labels
    '"Claude"',                // Standalone string (not in contexts like "claude-code")
    'name:"Claude"',           // Component names
];

for (const pattern of headerPatterns) {
    if (content.includes(pattern)) {
        content = content.split(pattern).join(pattern.replace('Claude', 'Claudy'));
        patchCount++;
        console.log(`  [OK] Replaced "${pattern}" → "${pattern.replace('Claude', 'Claudy')}"`);
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// PATCH 19: Replace "Claude" with "Claudy" in Security notes section
// This replaces "Claude can make mistakes" with "Claudy can make mistakes"
// ═══════════════════════════════════════════════════════════════════════════

if (content.includes('"Claude can make mistakes"')) {
    content = content.split('"Claude can make mistakes"').join('"Claudy can make mistakes"');
    patchCount++;
    console.log('  [OK] Replaced "Claude can make mistakes" → "Claudy can make mistakes"');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 20: Remove the URL from Security notes - keep only first sentence
// The pattern removes the URL link while keeping "Claudy can make mistakes"
// ═══════════════════════════════════════════════════════════════════════════

// Remove the "For more details see:" section entirely
const securityUrlPattern1 = ',W8.default.createElement(IW,null),W8.default.createElement(X9,{url:"https://code.claude.com/docs/en/security"}))))';
if (content.includes(securityUrlPattern1)) {
    content = content.split(securityUrlPattern1).join(')))');
    patchCount++;
    console.log('  [OK] Removed security URL from Security notes (pattern 1)');
}

// Alternative pattern for the URL removal
const securityUrlPattern2 = ',W8.default.createElement(IW,null),W8.default.createElement(X9,{url:"https://code.claude.com/docs/en/security"})';
if (content.includes(securityUrlPattern2)) {
    content = content.split(securityUrlPattern2).join('');
    patchCount++;
    console.log('  [OK] Removed security URL from Security notes (pattern 2)');
}

// Also try to remove the "For more details see:" text
if (content.includes('For more details see:"')) {
    content = content.split('For more details see:"').join('"');
    patchCount++;
    console.log('  [OK] Removed "For more details see:" text');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 21: Remove "API Usage Billing" from status line
// Replace "API Usage Billing" with empty string to hide it
// ═══════════════════════════════════════════════════════════════════════════

if (content.includes('"API Usage Billing"')) {
    content = content.split('"API Usage Billing"').join('""');
    patchCount++;
    console.log('  [OK] Removed "API Usage Billing" text');
}

// Also remove the billingType:Z display entirely by replacing the billing text
const billingPattern = 'billingType:Z,agentName:Y';
if (content.includes(billingPattern)) {
    content = content.split(billingPattern).join('billingType:"",agentName:Y');
    patchCount++;
    console.log('  [OK] Hidden billing type display');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 22: Remove "Bienvenue!" text from compact mode header
// This removes the welcome text that appears in the compact mode border box
// ═══════════════════════════════════════════════════════════════════════════

// Pattern for "Bienvenue!" in children array
const bienvenueCompactPattern1 = 'children:[TK1(G),';
if (content.includes(bienvenueCompactPattern1) && !content.includes('children:["",')) {
    content = content.split(bienvenueCompactPattern1).join('children:["",');
    patchCount++;
    console.log('  [OK] Removed "Bienvenue!" from compact mode header');
}

// Alternative pattern - replace the TK1 function call with empty string
const bienvenueCompactPattern2 = '_A=TK1(G);if(_A.length>Y-4)_A=TK1(null)';
if (content.includes(bienvenueCompactPattern2)) {
    content = content.split(bienvenueCompactPattern2).join('_A="";if(_A.length>Y-4)_A=""');
    patchCount++;
    console.log('  [OK] Disabled welcome message in compact mode (variant)');
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH 23: Remove border frame from compact mode welcome screen
// This removes the borderStyle:"round" and borderText from the compact mode box
// ═══════════════════════════════════════════════════════════════════════════

// Remove the border configuration from compact mode
const compactBorderPattern = ',borderStyle:"round",borderColor:"claude",borderText:{content:g,position:"top",align:"start",offset:1}';
if (content.includes(compactBorderPattern)) {
    content = content.split(compactBorderPattern).join('');
    patchCount++;
    console.log('  [OK] Removed border frame from compact mode welcome box');
}

// Also remove the borderText variable definition if it's only used for the border
const borderTextVarPattern = ',g=sQ("claude",S)(" Claude Code ")';
if (content.includes(borderTextVarPattern)) {
    content = content.split(borderTextVarPattern).join('');
    patchCount++;
    console.log('  [OK] Removed borderText variable (no longer needed)');
}


// ═══════════════════════════════════════════════════════════════════════════
// PATCH 24: SKIP WELCOME/ONBOARDING SCREEN - Go directly to chat
// This forces the app to skip the welcome screen with Security Notes
// ═══════════════════════════════════════════════════════════════════════════

// Pattern 1: Force hasCompletedProjectOnboarding to true globally
const onboardingFlagPattern = 'hasCompletedProjectOnboarding:!1';
if (content.includes(onboardingFlagPattern)) {
    content = content.split(onboardingFlagPattern).join('hasCompletedProjectOnboarding:!0');
    patchCount++;
    console.log('  [OK] Forced onboarding completion to true (pattern 1)');
}

// Pattern 2: Force projectOnboardingSeenCount to a high number
const onboardingCountPattern = 'projectOnboardingSeenCount:0';
if (content.includes(onboardingCountPattern)) {
    content = content.split(onboardingCountPattern).join('projectOnboardingSeenCount:999');
    patchCount++;
    console.log('  [OK] Set onboarding seen count to 999 (skip welcome screen)');
}

// Pattern 3: Skip showWelcomeScreen function - always return false
const showWelcomePattern = 'showWelcomeScreen(){';
if (content.includes(showWelcomePattern)) {
    content = content.split(showWelcomePattern).join('showWelcomeScreen(){return!1,');
    patchCount++;
    console.log('  [OK] Modified showWelcomeScreen to always return false');
}

// Pattern 4: Force shouldShowOnboarding to false
const shouldShowOnboardingPattern = 'shouldShowOnboarding:!0';
if (content.includes(shouldShowOnboardingPattern)) {
    content = content.split(shouldShowOnboardingPattern).join('shouldShowOnboarding:!1');
    patchCount++;
    console.log('  [OK] Forced shouldShowOnboarding to false');
}

// Pattern 5: Replace homeScreen check to skip directly to chat
const homeScreenCheckPattern = 'return!!(Y.hasCompletedProjectOnboarding||';
if (content.includes(homeScreenCheckPattern)) {
    content = content.split(homeScreenCheckPattern).join('return!0,');
    patchCount++;
    console.log('  [OK] Modified home screen check to skip welcome screen');
}

// ═══════════════════════════════════════════════════════════════════════════
// WRITE PATCHED COPY (NOT modifying original!)
// ═══════════════════════════════════════════════════════════════════════════

// Write the patched version to cli-claudy.js
fs.writeFileSync(claudyCliPath, content, 'utf8');

console.log(`[DONE] Created cli-claudy.js with ${patchCount} patches`);
console.log('[INFO] Original cli.js is UNCHANGED - "claude" command works normally');
console.log('[INFO] Claudy wrapper should use cli-claudy.js');
console.log('[INFO] All config now uses ~/.claudy/ instead of ~/.claude/');
console.log('[INFO] /cle-api command available - type / to see it in autocomplete');
console.log('[INFO] Security notes: Claude → Claudy, URL removed');
console.log('[INFO] "Bienvenue!" and border frame removed from compact mode');
console.log('[INFO] "API Usage Billing" removed from status line');
console.log('[INFO] Welcome/onboarding screen SKIPPED - goes directly to chat');
