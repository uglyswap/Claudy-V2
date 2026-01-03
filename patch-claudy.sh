#!/bin/bash
#
# Claudy Patch Script for Linux/macOS
# Fixes CLAUDE_CODE_MAX_OUTPUT_TOKENS (Windows npx bug doesn't affect Unix)
#
# Usage:
# bash patch-claudy.sh
#
set -e
# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
WHITE='\033[1;37m'
NC='\033[0m'
CLAUDY_DIR="$HOME/.claudy"
SETTINGS_PATH="$CLAUDY_DIR/settings.json"
CLAUDE_JSON_PATH="$CLAUDY_DIR/.claudy.json"
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN} CLAUDY PATCH - FIXES${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}Ce script corrige les problemes suivants :${NC}"
echo -e "${YELLOW}1. CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000${NC}"
echo -e "${GRAY}(Note: Le bug npx Windows n'affecte pas Linux/Mac)${NC}"
echo ""
# Check if Claudy is installed
if [ ! -f "$SETTINGS_PATH" ]; then
    echo -e "${RED}[ERREUR] Claudy n'est pas installe.${NC}"
    echo -e "${YELLOW}Installez-le d'abord avec:${NC}"
    echo -e "${GRAY}curl -fsSL https://raw.githubusercontent.com/uglyswap/Claudy-V2/main/install.sh | bash${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Claudy installe dans: $CLAUDY_DIR${NC}"
echo ""
# ============================================
# PATCH SETTINGS.JSON
# ============================================
echo -e "${YELLOW}Patch de settings.json...${NC}"
modified=false
# Check if python3 is available
if command -v python3 &> /dev/null; then
    # Check if CLAUDE_CODE_MAX_OUTPUT_TOKENS exists
    if ! python3 -c "import json; json.load(open('$SETTINGS_PATH'))['env']['CLAUDE_CODE_MAX_OUTPUT_TOKENS']" 2>/dev/null; then
        # Add CLAUDE_CODE_MAX_OUTPUT_TOKENS using Python
        python3 << PYTHON_SCRIPT
import json

with open('$SETTINGS_PATH', 'r') as f:
    settings = json.load(f)

# Add CLAUDE_CODE_MAX_OUTPUT_TOKENS if not exists
if 'CLAUDE_CODE_MAX_OUTPUT_TOKENS' not in settings.get('env', {}):
    if 'env' not in settings:
        settings['env'] = {}
    settings['env']['CLAUDE_CODE_MAX_OUTPUT_TOKENS'] = '200000'
    print('[OK] Ajoute CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000')

with open('$SETTINGS_PATH', 'w') as f:
    json.dump(settings, f, indent=2)
PYTHON_SCRIPT
        modified=true
    else
        echo -e "${GRAY}[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS deja present${NC}"
    fi
else
    echo -e "${YELLOW}[WARN] python3 non disponible, utilisation de sed${NC}"
    # Fallback: Check and add using grep/sed
    if ! grep -q "CLAUDE_CODE_MAX_OUTPUT_TOKENS" "$SETTINGS_PATH"; then
        # Insert after API_TIMEOUT_MS line
        sed -i.bak '/"API_TIMEOUT_MS"/a\    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "200000",' "$SETTINGS_PATH"
        rm -f "${SETTINGS_PATH}.bak"
        echo -e "${GREEN}[OK] Ajoute CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000${NC}"
        modified=true
    else
        echo -e "${GRAY}[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS deja present${NC}"
    fi
fi
# ============================================
# PATCH .CLAUDY.JSON
# ============================================
echo ""
echo -e "${YELLOW}Patch de .claudy.json...${NC}"
if [ -f "$CLAUDE_JSON_PATH" ]; then
    if command -v python3 &> /dev/null; then
        python3 << PYTHON_SCRIPT
import json

with open('$CLAUDE_JSON_PATH', 'r') as f:
    claudy_json = json.load(f)

modified = False
# No changes needed for Linux/Mac (npx works fine)
print('[OK] .claudy.json deja a jour (pas de changements pour Linux/Mac)')

with open('$CLAUDE_JSON_PATH', 'w') as f:
    json.dump(claudy_json, f, indent=2)
PYTHON_SCRIPT
    else
        echo -e "${GRAY}[OK] .claudy.json deja a jour${NC}"
    fi
else
    echo -e "${GRAY}[INFO] .claudy.json n'existe pas encore (normal si pas encore lance)${NC}"
fi
# ============================================
# SET ENVIRONMENT VARIABLE IN SHELL RC
# ============================================
echo ""
echo -e "${YELLOW}Configuration de la variable d'environnement...${NC}"
# Detect shell
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
# Add to shell rc if not already there
if ! grep -q "CLAUDE_CODE_MAX_OUTPUT_TOKENS" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Claudy - Max output tokens for long responses" >> "$SHELL_RC"
    echo "export CLAUDE_CODE_MAX_OUTPUT_TOKENS=\"200000\"" >> "$SHELL_RC"
    echo -e "${GREEN}[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000 (permanent)${NC}"
else
    echo -e "${GRAY}[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS deja configure${NC}"
fi
# Export for current session
export CLAUDE_CODE_MAX_OUTPUT_TOKENS="200000"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} PATCH TERMINE ! ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${WHITE}Corrections appliquees :${NC}"
echo -e "${GREEN}  [OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000${NC}"
echo -e "${GRAY}  (npx fonctionne correctement sur Linux/Mac, pas de patch necessaire)${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Rechargez votre shell pour que les changements prennent effet.${NC}"
echo -e "${GRAY}  Executez: source $SHELL_RC${NC}"
echo ""
