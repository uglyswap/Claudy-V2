#!/usr/bin/env pwsh
<#
.SYNOPSIS
Patch existing Claudy installation to fix Windows npx bug and add CLAUDE_CODE_MAX_OUTPUT_TOKENS.
.DESCRIPTION
This script fixes two issues in existing Claudy installations:
1. Windows: Changes zai-vision MCP from "npx" to "cmd /c npx"
2. Adds CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000 to environment variables
3. Sets CLAUDE_CODE_MAX_OUTPUT_TOKENS as permanent environment variable
.EXAMPLE
powershell -ExecutionPolicy Bypass -File patch-claudy.ps1
#>
$ErrorActionPreference = "Stop"
$claudyDir = Join-Path $env:USERPROFILE ".claudy"
$settingsPath = Join-Path $claudyDir "settings.json"
$claudyJsonPath = Join-Path $claudyDir ".claudy.json"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CLAUDY PATCH - FIXES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ce script corrige les problemes suivants :" -ForegroundColor Yellow
Write-Host "1. Windows: npx bug (cmd /c npx)" -ForegroundColor Yellow
Write-Host "2. CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000" -ForegroundColor Yellow
Write-Host ""
# Check if Claudy is installed
if (-not (Test-Path $settingsPath)) {
    Write-Host "[ERREUR] Claudy n'est pas installe." -ForegroundColor Red
    Write-Host "Installez-le d'abord avec: irm https://raw.githubusercontent.com/uglyswap/Claudy-V2/main/install.ps1 | iex" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Claudy installe dans: $claudyDir" -ForegroundColor Green
Write-Host ""
# ============================================
# PATCH SETTINGS.JSON
# ============================================
Write-Host "Patch de settings.json..." -ForegroundColor Yellow
try {
    $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    $modified = $false
    # Fix 1: Add CLAUDE_CODE_MAX_OUTPUT_TOKENS to env
    if ($settings.env.PSObject.Properties.Name -notcontains "CLAUDE_CODE_MAX_OUTPUT_TOKENS") {
        $settings.env | Add-Member -NotePropertyName "CLAUDE_CODE_MAX_OUTPUT_TOKENS" -NotePropertyValue "200000"
        $modified = $true
        Write-Host "[OK] Ajoute CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000" -ForegroundColor Green
    } else {
        Write-Host "[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS deja present" -ForegroundColor Gray
    }
    # Fix 2: Change zai-vision MCP from npx to cmd /c npx
    if ($settings.mcpServers.PSObject.Properties.Name -contains "zai-vision") {
        $zaiVision = $settings.mcpServers."zai-vision"
        if ($zaiVision.command -eq "npx") {
            $zaiVision.command = "cmd"
            $zaiVision.args = @("/c", "npx", "-y", "@z_ai/mcp-server")
            $modified = $true
            Write-Host "[OK] Fix Windows: cmd /c npx pour zai-vision" -ForegroundColor Green
        } else {
            Write-Host "[OK] zai-vision MCP deja corrige" -ForegroundColor Gray
        }
    }
    # Save if modified
    if ($modified) {
        $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding utf8 -Force
        Write-Host "[OK] settings.json mis a jour" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Impossible de patcher settings.json: $_" -ForegroundColor Yellow
}
# ============================================
# PATCH .CLAUDY.JSON
# ============================================
Write-Host ""
Write-Host "Patch de .claudy.json..." -ForegroundColor Yellow
if (Test-Path $claudyJsonPath) {
    try {
        $claudyJson = Get-Content $claudyJsonPath -Raw | ConvertFrom-Json
        $modified = $false
        # Get current project key
        $cwd = (Get-Location).Path.Replace("\", "/")
        # Fix zai-vision in all projects
        foreach ($projectKey in $claudyJson.projects.PSObject.Properties.Name) {
            if ($claudyJson.projects.$projectKey.mcpServers.PSObject.Properties.Name -contains "zai-vision") {
                $zaiVision = $claudyJson.projects.$projectKey.mcpServers."zai-vision"
                if ($zaiVision.command -eq "npx") {
                    $zaiVision.command = "cmd"
                    $zaiVision.args = @("/c", "npx", "-y", "@z_ai/mcp-server")
                    $modified = $true
                }
            }
        }
        # Save if modified
        if ($modified) {
            $claudyJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $claudyJsonPath -Encoding utf8 -Force
            Write-Host "[OK] .claudy.json mis a jour" -ForegroundColor Green
        } else {
            Write-Host "[OK] .claudy.json deja a jour" -ForegroundColor Gray
        }
    } catch {
        Write-Host "[WARN] Impossible de patcher .claudy.json: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "[INFO] .claudy.json n'existe pas encore (normal si pas encore lance)" -ForegroundColor Gray
}
# ============================================
# SET PERMANENT ENVIRONMENT VARIABLE
# ============================================
Write-Host ""
Write-Host "Configuration de la variable d'environnement..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("CLAUDE_CODE_MAX_OUTPUT_TOKENS", "200000", "User")
$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "200000"
Write-Host "[OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000 (permanent)" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " PATCH TERMINE ! " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Corrections appliquees :" -ForegroundColor White
Write-Host "  [OK] MCP zai-vision: cmd /c npx (fix Windows)" -ForegroundColor Green
Write-Host "  [OK] CLAUDE_CODE_MAX_OUTPUT_TOKENS = 200000" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Redemarrez votre terminal pour que les changements prennent effet." -ForegroundColor Yellow
Write-Host ""
