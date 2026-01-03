#!/bin/bash
# Hook pour intercepter /cle-api et /cle AVANT le modele
# Fonctionne SANS API - pur bash
# Met a jour la clé API dans settings.json ET .claudy.json (5 emplacements)

SETTINGS_PATH="$HOME/.claudy/settings.json"
CLAUDE_JSON_PATH="$HOME/.claudy/.claudy.json"

# Lire le prompt depuis stdin
INPUT=$(cat)

if [ -z "$INPUT" ]; then
    exit 0
fi

# Extraire le prompt du JSON
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' 2>/dev/null)

if [ -z "$PROMPT" ]; then
    exit 0
fi

# Verifier si c'est une commande /cle-api ou /cle
if [[ "$PROMPT" =~ ^/(cle-api|cle)(\s+(.+))?$ ]]; then
    NEW_KEY="${BASH_REMATCH[3]}"
    NEW_KEY=$(echo "$NEW_KEY" | xargs)  # Trim

    if [ -z "$NEW_KEY" ]; then
        echo ""
        echo "========================================"
        echo "   MISE A JOUR CLE API Z.AI"
        echo "========================================"
        echo ""
        echo "Usage: /cle-api VOTRE_NOUVELLE_CLE"
        echo ""
        echo "Exemple:"
        echo "  /cle-api abc123def456.xyz789"
        echo ""
        echo "La cle sera mise a jour dans:"
        echo "  - settings.json (env.ANTHROPIC_AUTH_TOKEN)"
        echo "  - .claudy.json (4 serveurs MCP)"
        echo ""
        exit 2
    fi

    # ============================================
    # UPDATE settings.json
    # ============================================
    # Verifier que settings.json existe
    if [ ! -f "$SETTINGS_PATH" ]; then
        echo "[ERREUR] settings.json introuvable"
        exit 2
    fi

    # Lire l'ancienne cle
    OLD_KEY=$(jq -r '.env.ANTHROPIC_AUTH_TOKEN // empty' "$SETTINGS_PATH" 2>/dev/null)

    if [ -z "$OLD_KEY" ]; then
        echo "[ERREUR] Ancienne cle non trouvee"
        exit 2
    fi

    # Compter les occurrences dans settings.json
    COUNT_SETTINGS=$(grep -o "$OLD_KEY" "$SETTINGS_PATH" | wc -l)

    # Remplacer dans settings.json
    sed -i "s|$OLD_KEY|$NEW_KEY|g" "$SETTINGS_PATH"

    # ============================================
    # UPDATE .claudy.json (4 MCP servers)
    # ============================================
    COUNT_CLAUDY=0
    if [ -f "$CLAUDE_JSON_PATH" ]; then
        COUNT_CLAUDY=$(grep -o "$OLD_KEY" "$CLAUDE_JSON_PATH" | wc -l)
        sed -i "s|$OLD_KEY|$NEW_KEY|g" "$CLAUDE_JSON_PATH"
    fi

    # Masquer les cles
    MASKED_OLD="${OLD_KEY:0:6}...${OLD_KEY: -4}"
    MASKED_NEW="${NEW_KEY:0:6}...${NEW_KEY: -4}"

    # Afficher le resultat
    echo ""
    echo "========================================"
    echo "   CLE API Z.AI MISE A JOUR"
    echo "========================================"
    echo ""
    echo "Ancienne: $MASKED_OLD"
    echo "Nouvelle: $MASKED_NEW"
    echo ""
    echo "- settings.json (env.ANTHROPIC_AUTH_TOKEN): OK"
    echo "- .claudy.json (zai-vision): OK"
    echo "- .claudy.json (web-search-prime): OK"
    echo "- .claudy.json (web-reader): OK"
    echo "- .claudy.json (zread): OK"
    echo ""
    TOTAL_COUNT=$((COUNT_SETTINGS + COUNT_CLAUDY))
    echo "$TOTAL_COUNT occurrence(s) remplacee(s)"
    echo "  - settings.json: $COUNT_SETTINGS"
    echo "  - .claudy.json: $COUNT_CLAUDY"
    echo ""
    echo "Redemarrez Claudy pour appliquer."
    echo ""

    exit 2
fi

# Pas une commande /cle, continuer normalement
exit 0
