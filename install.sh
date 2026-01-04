#!/bin/bash
#
# Claudy Installer for Linux/macOS
# Pre-configured with GLM 4.7 (Z.AI), MCP servers, ASCII logo, and AKHITHINK prompt
# Claudy is installed INDEPENDENTLY from Claude Code CLI - completely separate installations.
#
# This means:
# - Uninstalling Claude Code does NOT affect Claudy
# - Updating Claude Code does NOT affect Claudy
# - Both programs are 100% independent
# - claudy uses cli-claudy.js, claude uses cli.js
#
# Usage:
# curl -fsSL https://raw.githubusercontent.com/uglyswap/Claudy-V2/main/install.sh | bash
#
set -e
# Version figee pour eviter les breaking changes d'Anthropic
CLAUDE_CODE_VERSION="2.0.74"
# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;95m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m'
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN} CLAUDY INSTALLER ${NC}"
echo -e "${CYAN} Powered by GLM 4.7 (Z.AI) ${NC}"
echo -e "${GRAY} Claude Code v${CLAUDE_CODE_VERSION} (frozen) ${NC}"
echo -e "${YELLOW} INSTALLATION INDEPENDANTE ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERREUR] Node.js n'est pas installe.${NC}"
    echo ""
    echo -e "${YELLOW}Telechargez Node.js ici : https://nodejs.org/${NC}"
    echo -e "${YELLOW}Choisissez la version LTS (recommandee).${NC}"
    echo ""
    exit 1
fi
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${RED}[ERREUR] Node.js 18 ou superieur est requis.${NC}"
    echo -e "${RED}Version actuelle : $NODE_VERSION${NC}"
    echo ""
    echo -e "${YELLOW}Telechargez la derniere version : https://nodejs.org/${NC}"
    echo ""
    exit 1
fi
echo -e "${GREEN}[OK] Node.js $NODE_VERSION${NC}"
# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERREUR] npm n'est pas installe.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] npm${NC}"
# ============================================
# CREATE ISOLATED CLAUDY INSTALLATION
# ============================================
CLAUDY_DIR="$HOME/.claudy"
CLAUDY_LIB_DIR="$CLAUDY_DIR/lib"
CLAUDY_BIN_DIR="$CLAUDY_DIR/bin"
CLAUDY_HOOKS_DIR="$CLAUDY_DIR/hooks"
# Create directories
mkdir -p "$CLAUDY_DIR"
mkdir -p "$CLAUDY_LIB_DIR"
mkdir -p "$CLAUDY_BIN_DIR"
mkdir -p "$CLAUDY_HOOKS_DIR"
echo ""
echo -e "${YELLOW}Installation de Claude Code v${CLAUDE_CODE_VERSION} dans ~/.claudy/lib/...${NC}"
echo -e "${GRAY}(Installation isolee, independante de npm global)${NC}"
# Initialize package.json in lib directory if not exists
PACKAGE_JSON_PATH="$CLAUDY_LIB_DIR/package.json"
if [ ! -f "$PACKAGE_JSON_PATH" ]; then
cat > "$PACKAGE_JSON_PATH" << 'EOF'
{
  "name": "claudy-local",
  "version": "1.0.0",
  "description": "Claudy isolated installation",
  "private": true
}
EOF
fi
# Install claude-code locally in ~/.claudy/lib/
cd "$CLAUDY_LIB_DIR"
npm install "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERREUR] Echec de l'installation.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Claude Code v${CLAUDE_CODE_VERSION} installe dans ~/.claudy/lib/${NC}"
# ============================================
# PATCH CLI.JS WITH CLAUDY BRANDING & LOGO
# ============================================
echo -e "${YELLOW}Application du branding Claudy...${NC}"
# Download and run the patch script with local path
PATCH_SCRIPT_URL="https://raw.githubusercontent.com/uglyswap/Claudy-V2/main/patch-claudy-logo.js"
PATCH_SCRIPT_PATH="/tmp/patch-claudy-logo.js"
if curl -fsSL "$PATCH_SCRIPT_URL" -o "$PATCH_SCRIPT_PATH" 2>/dev/null; then
    # Pass the local installation path as argument
    node "$PATCH_SCRIPT_PATH" "$CLAUDY_LIB_DIR" 2>&1 || true
    rm -f "$PATCH_SCRIPT_PATH"
    echo -e "${MAGENTA}[OK] cli-claudy.js cree avec logo CLAUDY${NC}"
else
    echo -e "${YELLOW}[WARN] Impossible de telecharger le patch logo${NC}"
fi
# Download logo script
echo -e "${YELLOW}Installation du logo anime...${NC}"
LOGO_SCRIPT_URL="https://raw.githubusercontent.com/uglyswap/Claudy-V2/main/claudy-logo.sh"
LOGO_SCRIPT_PATH="$CLAUDY_BIN_DIR/claudy-logo.sh"
curl -fsSL "$LOGO_SCRIPT_URL" -o "$LOGO_SCRIPT_PATH" 2>/dev/null || true
chmod +x "$LOGO_SCRIPT_PATH" 2>/dev/null || true
echo -e "${GREEN}[OK] Logo anime installe${NC}"

# NOTE: sync-mcp.js is no longer needed - MCP servers are now directly in .claude.json
echo -e "${GRAY}[INFO] MCP servers will be configured directly in .claude.json${NC}"

# ============================================
# DOWNLOAD CLAUDY WRAPPER FROM GITHUB
# ============================================
echo -e "${YELLOW}Telechargement du wrapper claudy...${NC}"
CLAUDY_WRAPPER_URL="https://raw.githubusercontent.com/uglyswap/Claudy-V2/main/bin/claudy"
CLAUDY_WRAPPER_PATH="$CLAUDY_BIN_DIR/claudy"
if curl -fsSL "$CLAUDY_WRAPPER_URL" -o "$CLAUDY_WRAPPER_PATH" 2>/dev/null; then
    chmod +x "$CLAUDY_WRAPPER_PATH"
    echo -e "${GREEN}[OK] Wrapper claudy telecharge depuis GitHub${NC}"
else
    echo -e "${YELLOW}[WARN] Impossible de telecharger le wrapper, creation du wrapper par defaut${NC}"
    # Fallback: create a basic wrapper if download fails
    cat > "$CLAUDY_WRAPPER_PATH" << 'WRAPPER_FALLBACK'
#!/bin/bash
echo -e "\033[0;31m[ERREUR] Wrapper local non trouve. Reinstallez Claudy-V2.\033[0m"
exit 1
WRAPPER_FALLBACK
    chmod +x "$CLAUDY_WRAPPER_PATH"
fi
# ============================================
# ADD CLAUDY TO PATH
# ============================================
echo -e "${YELLOW}Configuration du PATH...${NC}"
# Detect shell and config file
SHELL_NAME=$(basename "$SHELL")
case "$SHELL_NAME" in
    bash)
        if [ -f "$HOME/.bash_profile" ]; then
            SHELL_RC="$HOME/.bash_profile"
        else
            SHELL_RC="$HOME/.bashrc"
        fi
        ;;
    zsh)
        SHELL_RC="$HOME/.zshrc"
        ;;
    *)
        SHELL_RC="$HOME/.profile"
        ;;
esac
# Add to PATH if not already there
PATH_LINE='export PATH="$HOME/.claudy/bin:$PATH"'
if ! grep -q ".claudy/bin" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Claudy - Independent Claude Code installation" >> "$SHELL_RC"
    echo "$PATH_LINE" >> "$SHELL_RC"
    echo -e "${GREEN}[OK] ~/.claudy/bin/ ajoute au PATH dans $SHELL_RC${NC}"
    echo -e "${YELLOW}[INFO] Executez 'source $SHELL_RC' ou redemarrez votre terminal${NC}"
else
    echo -e "${GREEN}[OK] ~/.claudy/bin/ deja dans le PATH${NC}"
fi
# Also add to current session
export PATH="$HOME/.claudy/bin:$PATH"
# Set CLAUDE_CODE_MAX_OUTPUT_TOKENS environment variable
echo -e "${YELLOW}Configuration de CLAUDE_CODE_MAX_OUTPUT_TOKENS...${NC}"
export CLAUDE_CODE_MAX_OUTPUT_TOKENS="200000"
# Add to shell rc file
if ! grep -q "CLAUDE_CODE_MAX_OUTPUT_TOKENS" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Claudy - Max output tokens for long responses" >> "$SHELL_RC"
    echo "export CLAUDE_CODE_MAX_OUTPUT_TOKENS=\"200000\"" >> "$SHELL_RC"
    echo -e "${GREEN}[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000 (permanent)${NC}"
else
    echo -e "${GREEN}[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS deja configure${NC}"
fi
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN} CONFIGURATION GLM 4.7 (Z.AI) ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${WHITE}Pour utiliser Claudy, vous avez besoin d'une cle API Z.AI.${NC}"
echo ""
echo -e "${YELLOW}Si vous n'en avez pas encore :${NC}"
echo -e "${YELLOW} 1. Allez sur https://open.z.ai/${NC}"
echo -e "${YELLOW} 2. Creez un compte ou connectez-vous${NC}"
echo -e "${YELLOW} 3. Allez dans la gestion des cles API${NC}"
echo -e "${YELLOW} 4. Creez une nouvelle cle${NC}"
echo ""
echo -n "Entrez votre cle API Z.AI (ou appuyez sur Entree pour configurer plus tard): "
read API_KEY
SETTINGS_PATH="$CLAUDY_DIR/settings.json"
KEY_CONFIGURED=true
if [ -z "$API_KEY" ]; then
    API_KEY="VOTRE_CLE_API_ZAI_ICI"
    KEY_CONFIGURED=false
    echo ""
    echo -e "${YELLOW}[INFO] Configuration creee sans cle API.${NC}"
    echo -e "${YELLOW} Au demarrage de Claudy, il vous demandera votre cle.${NC}"
fi
# Create settings.json with GLM config, MCP servers, bypass permissions
# NOTE: No hooks - /cle-api is now a native command injected in cli-claudy.js
cat > "$SETTINGS_PATH" << EOF
{
"permissionMode": "bypassPermissions",
"confirmations": {
"fileOperations": false,
"bashCommands": false,
"toolUse": false
},
"autoApprove": true,
"env": {
"ANTHROPIC_AUTH_TOKEN": "$API_KEY",
"ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
"API_TIMEOUT_MS": "3000000",
"CLAUDE_CODE_MAX_OUTPUT_TOKENS": "200000",
"ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.7",
"ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
"ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7",
"DISABLE_AUTOUPDATER": "1"
},
"mcpServers": {
"zai-vision": {
"type": "stdio",
"command": "npx",
"args": ["-y", "@z_ai/mcp-server"],
"env": {
"Z_AI_API_KEY": "$API_KEY",
"Z_AI_MODE": "ZAI"
}
},
"web-search-prime": {
"type": "http",
"url": "https://api.z.ai/api/mcp/web_search_prime/mcp",
"headers": {
"Authorization": "Bearer $API_KEY"
}
},
"web-reader": {
"type": "http",
"url": "https://api.z.ai/api/mcp/web_reader/mcp",
"headers": {
"Authorization": "Bearer $API_KEY"
}
},
"zread": {
"type": "http",
"url": "https://api.z.ai/api/mcp/zread/mcp",
"headers": {
"Authorization": "Bearer $API_KEY"
}
}
}
}
EOF
echo -e "${GREEN}[OK] Configuration GLM 4.7 creee${NC}"
echo -e "${GREEN}[OK] Mode bypass permissions active${NC}"
echo -e "${GREEN}[OK] Auto-updater desactive${NC}"
echo -e "${GREEN}[OK] 4 serveurs MCP configures${NC}"
echo -e "${GREEN}[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000${NC}"

# Create .claude.json with MCP servers directly configured
# This ensures MCP servers appear in /mcp command without needing sync script
CLAUDE_JSON_PATH="$CLAUDY_DIR/.claude.json"
cat > "$CLAUDE_JSON_PATH" << EOF
{
  "mcpServers": {
    "zai-vision": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@z_ai/mcp-server"],
      "env": {
        "Z_AI_API_KEY": "$API_KEY",
        "Z_AI_MODE": "ZAI"
      }
    },
    "web-search-prime": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer $API_KEY"
      }
    },
    "web-reader": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/web_reader/mcp",
      "headers": {
        "Authorization": "Bearer $API_KEY"
      }
    },
    "zread": {
      "type": "http",
      "url": "https://api.z.ai/api/mcp/zread/mcp",
      "headers": {
        "Authorization": "Bearer $API_KEY"
      }
    }
  }
}
EOF

echo -e "${GREEN}[OK] .claude.json cree avec MCP servers${NC}"
# ============================================
# DOWNLOAD CLAUDE.MD FROM GITHUB
# ============================================
echo -e "${YELLOW}Installation du system prompt...${NC}"
CLAUDE_MD_PATH="$CLAUDY_DIR/CLAUDE.md"
CLAUDE_MD_URL="https://raw.githubusercontent.com/uglyswap/Claudy-V2/main/CLAUDE.md"
if curl -fsSL "$CLAUDE_MD_URL" -o "$CLAUDE_MD_PATH" 2>/dev/null; then
    echo -e "${MAGENTA}[OK] System prompt AKHITHINK installe${NC}"
    echo -e "${MAGENTA}[OK] Identite Claudy Focan configuree${NC}"
else
    echo -e "${YELLOW}[WARN] Impossible de telecharger CLAUDE.md${NC}"
fi
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} INSTALLATION TERMINEE ! ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${WHITE}Pour utiliser Claudy, tapez simplement :${NC}"
echo ""
echo -e "${CYAN} claudy${NC}"
echo ""
echo -e "${WHITE}Options du logo anime:${NC}"
echo -e "${GRAY} claudy --no-logo Desactive le logo anime${NC}"
echo -e "${GRAY} claudy -n Raccourci pour --no-logo${NC}"
echo ""
if [ "$KEY_CONFIGURED" = false ]; then
    echo -e "${YELLOW}Au premier demarrage, Claudy vous demandera votre cle API Z.AI.${NC}"
    echo ""
fi
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN} INDEPENDANCE TOTALE ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${WHITE}Claudy est 100% independant de Claude Code :${NC}"
echo -e "${GRAY} - Installation isolee : ~/.claudy/lib/${NC}"
echo -e "${GRAY} - CLI patche : cli-claudy.js (pas cli.js)${NC}"
echo -e "${GRAY} - Configuration isolee : ~/.claudy/settings.json${NC}"
echo -e "${GRAY} - Binaires isoles : ~/.claudy/bin/${NC}"
echo ""
echo -e "${WHITE}Claude Code (officiel) reste intact :${NC}"
echo -e "${GRAY} - Commande 'claude' inchangee${NC}"
echo -e "${GRAY} - Utilise ~/.claude/ (pas ~/.claudy/)${NC}"
echo -e "${GRAY} - Aucune modification de cli.js${NC}"
echo ""
echo -e "${WHITE}Fonctionnalites Claudy :${NC}"
echo -e "${MAGENTA} - Logo CLAUDY avec degrade jaune-magenta${NC}"
echo -e "${GREEN} - GLM 4.7 (pas besoin de compte Anthropic)${NC}"
echo -e "${GREEN} - Vision IA (images, videos, OCR)${NC}"
echo -e "${GREEN} - Recherche web${NC}"
echo -e "${GREEN} - Lecture de pages web${NC}"
echo -e "${GREEN} - Mode sans permissions (pas de confirmations)${NC}"
echo -e "${GREEN} - Version figee ${CLAUDE_CODE_VERSION} (pas de mises a jour auto)${NC}"
echo -e "${MAGENTA} - AKHITHINK: Deep reasoning mode${NC}"
echo -e "${MAGENTA} - Identite Claudy Focan (Dikkenek)${NC}"
echo -e "${CYAN} - /cle-api: Changer la cle API (natif, sans modele)${NC}"
echo -e "${GREEN} - FIX: CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000 (permanent)${NC}"
echo ""
echo -e "${GRAY}Structure d'installation :${NC}"
echo -e "${GRAY} ~/.claudy/${NC}"
echo -e "${GRAY} +-- bin/ (claudy)${NC}"
echo -e "${GRAY} +-- lib/ (node_modules avec cli-claudy.js)${NC}"
echo -e "${GRAY} +-- settings.json (configuration)${NC}"
echo -e "${GRAY} +-- CLAUDE.md (system prompt)${NC}"
echo ""
