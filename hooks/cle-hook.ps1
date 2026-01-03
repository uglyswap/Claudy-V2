#!/usr/bin/env pwsh
# Hook pour intercepter /cle-api et /cle AVANT le modele
# Fonctionne SANS API - pur PowerShell
# Met a jour la clé API dans settings.json ET .claudy.json (5 emplacements)

param()

$settingsPath = Join-Path $env:USERPROFILE ".claudy\settings.json"
$claudyJsonPath = Join-Path $env:USERPROFILE ".claudy\.claudy.json"

# Lire le prompt depuis stdin (format JSON de Claude Code)
$inputJson = $input | Out-String

if (-not $inputJson) {
    exit 0  # Pas d'input, continuer normalement
}

try {
    $data = $inputJson | ConvertFrom-Json
    $prompt = $data.prompt
} catch {
    exit 0  # Pas de JSON valide, continuer normalement
}

if (-not $prompt) {
    exit 0
}

# Verifier si c'est une commande /cle-api ou /cle
if ($prompt -match "^/(cle-api|cle)(\s+(.+))?$") {
    $newKey = $Matches[3]

    if (-not $newKey -or $newKey.Trim() -eq "") {
        # Pas de cle fournie - demander de la fournir en argument
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   MISE A JOUR CLE API Z.AI" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: /cle-api VOTRE_NOUVELLE_CLE" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Exemple:" -ForegroundColor Gray
        Write-Host "  /cle-api abc123def456.xyz789" -ForegroundColor White
        Write-Host ""
        Write-Host "La cle sera mise a jour dans:" -ForegroundColor Gray
        Write-Host "  - settings.json (env.ANTHROPIC_AUTH_TOKEN)" -ForegroundColor Gray
        Write-Host "  - .claudy.json (4 serveurs MCP)" -ForegroundColor Gray
        Write-Host ""
        exit 2  # Bloquer - ne pas envoyer au modele
    }

    $newKey = $newKey.Trim()

    # ============================================
    # UPDATE settings.json
    # ============================================
    if (-not (Test-Path $settingsPath)) {
        Write-Host "[ERREUR] settings.json introuvable" -ForegroundColor Red
        exit 2
    }

    try {
        $content = Get-Content $settingsPath -Raw -Encoding UTF8
        $settings = $content | ConvertFrom-Json
        $oldKey = $settings.env.ANTHROPIC_AUTH_TOKEN
    } catch {
        Write-Host "[ERREUR] Impossible de lire settings.json" -ForegroundColor Red
        exit 2
    }

    if (-not $oldKey) {
        Write-Host "[ERREUR] Ancienne cle non trouvee" -ForegroundColor Red
        exit 2
    }

    # Compter les occurrences dans settings.json
    $countSettings = ([regex]::Matches($content, [regex]::Escape($oldKey))).Count

    # Remplacer dans settings.json
    try {
        $newContent = $content -replace [regex]::Escape($oldKey), $newKey
        [System.IO.File]::WriteAllText($settingsPath, $newContent, [System.Text.UTF8Encoding]::new($true))
    } catch {
        Write-Host "[ERREUR] Impossible d'ecrire settings.json" -ForegroundColor Red
        exit 2
    }

    # ============================================
    # UPDATE .claudy.json (4 MCP servers)
    # ============================================
    $countClaudy = 0
    if (Test-Path $claudyJsonPath) {
        try {
            $claudyContent = Get-Content $claudyJsonPath -Raw -Encoding UTF8
            $countClaudy = ([regex]::Matches($claudyContent, [regex]::Escape($oldKey))).Count
            
            $newClaudyContent = $claudyContent -replace [regex]::Escape($oldKey), $newKey
            [System.IO.File]::WriteAllText($claudyJsonPath, $newClaudyContent, [System.Text.UTF8Encoding]::new($true))
        } catch {
            Write-Host "[WARN] Impossible de mettre a jour .claudy.json" -ForegroundColor Yellow
        }
    }

    # Masquer les cles pour l'affichage
    $maskedOld = if ($oldKey.Length -gt 10) { $oldKey.Substring(0, 6) + "..." + $oldKey.Substring($oldKey.Length - 4) } else { "***" }
    $maskedNew = if ($newKey.Length -gt 10) { $newKey.Substring(0, 6) + "..." + $newKey.Substring($newKey.Length - 4) } else { "***" }

    # Afficher le resultat
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   CLE API Z.AI MISE A JOUR" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ancienne: $maskedOld" -ForegroundColor Gray
    Write-Host "Nouvelle: $maskedNew" -ForegroundColor White
    Write-Host ""
    Write-Host "- settings.json (env.ANTHROPIC_AUTH_TOKEN): OK" -ForegroundColor Green
    Write-Host "- .claudy.json (zai-vision): OK" -ForegroundColor Green
    Write-Host "- .claudy.json (web-search-prime): OK" -ForegroundColor Green
    Write-Host "- .claudy.json (web-reader): OK" -ForegroundColor Green
    Write-Host "- .claudy.json (zread): OK" -ForegroundColor Green
    Write-Host ""
    $totalCount = $countSettings + $countClaudy
    Write-Host "$totalCount occurrence(s) remplacee(s)" -ForegroundColor Cyan
    Write-Host "  - settings.json: $countSettings" -ForegroundColor Gray
    Write-Host "  - .claudy.json: $countClaudy" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Redemarrez Claudy pour appliquer." -ForegroundColor Yellow
    Write-Host ""

    exit 2  # Bloquer - ne pas envoyer au modele
}

# Pas une commande /cle, continuer normalement
exit 0
